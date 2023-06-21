/* TODO double check the WCA and GS formulas. */
function wind_correction_angle(wind_angle, wind_speed, true_airspeed, true_track) {
    const inc_angle = true_track - (wind_angle + 180);
    return rad_to_deg(Math.asin(Math.sin(deg_to_rad(inc_angle)) * wind_speed / true_airspeed));
}

function ground_speed(wind_angle, wind_speed, true_airspeed, true_track) {
    const inc_angle = true_track - (wind_angle + 180);
    return true_airspeed + wind_speed * Math.cos(deg_to_rad(inc_angle));
}

// Convert a number of milliseconds since the Unix epoch to a time on format hh:mm.
function epoch_ms_to_time(epoch_ms) {
    const date = new Date(epoch_ms);
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
}

function calc_route_info(wind_angle, wind_speed, variation, true_airspeed, fuel_consumption, climb_speed, date_of_flight, departure_time, route) {
    let route_info = [];
    let ms_since_epoch = new Date(date_of_flight + 'T' + departure_time).getTime();
    for (let i = 0; i < route.length; i++) {
        const wca = wind_correction_angle(wind_angle, wind_speed, true_airspeed, route[i].true_track);
        const th = route[i].true_track + wca;
        const gs = ground_speed(wind_angle, wind_speed, true_airspeed, route[i].true_track);
        const travel_hours = route[i].distance / gs;
        // If we're on the first leg, or we have a positive altitude change,
        // then we need to take into account the time needed to climb.
        // NOTE: It's not mathematically sound to simply add the times like this,
        // but for a first approximation it works, especially since the values are low.
        let climb_mins = 0;
        if (i === 0) {
            climb_mins = route[i].altitude / climb_speed;
        } else if (route[i - 1].altitude < route[i].altitude) {
            climb_mins = (route[i].altitude - route[i - 1].altitude) / climb_speed;
        }
        const tol_mins = travel_hours * 60 + climb_mins;
        // Strange way to keep track of the time, due to JS missing an addMinutes() function on Date objects.
        ms_since_epoch += tol_mins * 60 * 1000;
        route_info.push({
            wind_correction_angle: wca,
            true_heading: th,
            compass_heading: th - variation,
            ground_speed: gs,
            time_on_leg: tol_mins,
            fuel_required: travel_hours * fuel_consumption,
            climb_time: climb_mins,
            estimated_time_over: epoch_ms_to_time(ms_since_epoch),
        });
    }
    return route_info;
}

function calc_atc_route(route) {
    let atc_route = '';
    for (let i = 0; i < route.length - 1; i++) {
        atc_route += 'DCT ' + route[i].to + ' ';
    }
    atc_route += 'DCT';
    return atc_route;
}

// Get current date on YYYY-MM-DD format, in the local timezone (i.e. cannot use toISOString)
function current_local_date() {
    const date = new Date();
    return date.getFullYear().toString()
        + '-' + (date.getMonth() + 1).toString().padStart(2, '0')
        + '-' + date.getDate().toString().padStart(2, '0');
}

// Convert a date on format YYYY-MM-DD to a date on format YYMMDD
function to_atc_date(datestr) {
    const date = new Date(datestr);
    return date.getFullYear().toString().slice(2)
        + (date.getMonth() + 1).toString().padStart(2, '0')
        + date.getDate().toString().padStart(2, '0');
}

// Convert a local date and time to an UTC time on the form hhmm
function to_atc_departure_time(datestr, timestr) {
    const date = new Date(datestr + 'T' + timestr);
    console.log(date);
    return date.getUTCHours().toString().padStart(2, '0') + date.getUTCMinutes().toString().padStart(2, '0');
}

function to_atc_eet(route_mins) {
    return (route_mins / 60).toFixed(0).padStart(2, '0') + (route_mins % 60).toFixed(0).padStart(2, '0');
}

// Very hacky heuristic for ICAO location indicators. TODO improve this.
function is_icao_airport(name) {
    // If length is 4 and prefix is Sweden, Finland, Denmark, or Norway
    const country_prefix = ['ES', 'EF', 'EK', 'EN'];
    return name.length === 4 && country_prefix.some((p) => name.startsWith(p));
}

function weight_of_9196ul(volume) {
    return volume * 0.72;
}

const { createApp, ref, computed } = Vue;
createApp({
    setup() {
        const reg = ref('SE-EMW');
        const aircraft = computed(() => aircraft_data[reg.value]);

        /* Route Information */
        const wind_angle = ref(90); // NOTE: example value
        const wind_speed = ref(15); // NOTE: example value
        const variation = ref(7); // NOTE: example value

        const date_of_flight = ref(current_local_date());
        const departure_time = ref('12:00');
        const cruise_altitude = ref(4500);

        const route = ref([
            {from: 'ESSL', true_track: 170, distance: 6, to: 'VSN', altitude: 1500},
            {from: 'VSN', true_track: 350, distance: 12, to: 'MOTALA', altitude: 3500},
        ]);
        const route_info = computed(() =>
            calc_route_info(wind_angle.value, wind_speed.value, variation.value,
                aircraft.value.cruise_speed, aircraft.value.fuel_consumption, aircraft.value.climb_vertical_speed,
                date_of_flight.value, departure_time.value,
                route.value));
        const time_on_route = computed(() =>
            route_info.value.map((leg) => leg.time_on_leg).reduce((t, acc) => t + acc, 0));
        const total_fuel_required = computed(() =>
            route_info.value.map((leg) => leg.fuel_required).reduce((t, acc) => t + acc, 0));

        function add_route_leg(i) {
            route.value.splice(i + 1, 0, {from: '', true_track: 0, distance: 0, to: ''});
        }

        function del_route_leg(i) {
            if (route.value.length > 1) {
                route.value.splice(i, 1);
            }
        }

        /* Weight and Balance */
        const fuel_volume = ref(aircraft.value.max_fuel_volume.toFixed(1));
        const fuel_weight = computed(() => weight_of_9196ul(fuel_volume.value));
        const weight = ref({
            'Front seats': 160, // NOTE: example value
            'Rear seats': 80, // NOTE: example value
            'Baggage': 20, // NOTE: example value
        });
        const moment = (name) => {
            if (name === 'BEW') {
                return aircraft.value.bew * aircraft.value.arm[name];
            } else if (name === 'Fuel') {
                return fuel_weight.value * aircraft.value.arm[name];
            } else {
                return weight.value[name] * aircraft.value.arm[name];
            }
        };
        const dry_weight = computed(() =>
            aircraft.value.bew + weight.value['Front seats'] + weight.value['Rear seats'] + weight.value['Baggage']);
        const ramp_weight = computed(() =>
            dry_weight.value + fuel_weight.value);
        const dry_moment = computed(() =>
            moment('BEW') + moment('Front seats') + moment('Rear seats') + moment('Baggage'));
        const ramp_moment = computed(() =>
            dry_moment.value + moment('Fuel'));
        const dry_arm = computed(() => dry_moment.value / dry_weight.value);
        const ramp_arm = computed(() => ramp_moment.value / ramp_weight.value);

        /* ATC flight plan */
        const atc_route = computed(() => calc_atc_route(route.value));
        const atc_departure_time = computed(() => to_atc_departure_time(date_of_flight.value, departure_time.value));
        const atc_route_eet = computed(() => to_atc_eet(time_on_route.value));
        const atc_departure = computed(() =>
            is_icao_airport(route.value[0].from) ? route.value[0].from : 'ZZZZ');
        const atc_destination = computed(() =>
            is_icao_airport(route.value[route.value.length - 1].to) ? route.value[route.value.length - 1].to : 'ZZZZ');
        const atc_other_departure = computed(() =>
            is_icao_airport(route.value[0].from) ? '' : ' DEP/' + route.value[0].from);
        const atc_other_destination = computed(() =>
            is_icao_airport(route.value[route.value.length - 1].to) ? '' : ' DEST/' + route.value[route.value.length - 1].to);
        const atc_date_of_flight = computed(() =>
            date_of_flight.value === current_local_date() ? '' : ' DOF/' + to_atc_date(date_of_flight.value));

        return {
            reg,
            aircraft,

            wind_angle,
            wind_speed,
            variation,

            date_of_flight,
            departure_time,
            cruise_altitude,

            route,
            route_info,
            time_on_route,
            total_fuel_required,
            add_route_leg,
            del_route_leg,

            weight,
            fuel_volume,
            fuel_weight,
            moment,
            dry_weight,
            ramp_weight,
            dry_moment,
            ramp_moment,
            dry_arm,
            ramp_arm,

            atc_route,
            atc_departure_time,
            atc_route_eet,
            atc_departure,
            atc_destination,
            atc_other_departure,
            atc_other_destination,
            atc_date_of_flight,
        };
    },
}).mount('#app');
