/* TODO double check the WCA and GS formulas. */
function wind_correction_angle(wind_angle, wind_speed, true_airspeed, true_track) {
    const inc_angle = true_track - (wind_angle + 180);
    return rad_to_deg(Math.asin(Math.sin(deg_to_rad(inc_angle)) * wind_speed / true_airspeed));
}

function ground_speed(wind_angle, wind_speed, true_airspeed, true_track) {
    const inc_angle = true_track - (wind_angle + 180);
    return true_airspeed + wind_speed * Math.cos(deg_to_rad(inc_angle));
}

function calc_route_info(wind_angle, wind_speed, variation, true_airspeed, fuel_consumption, route) {
    let route_info = [];
    for (let i = 0; i < route.length; i++) {
        const wca = wind_correction_angle(wind_angle, wind_speed, true_airspeed, route[i].true_track);
        const th = route[i].true_track + wca;
        const gs = ground_speed(wind_angle, wind_speed, true_airspeed, route[i].true_track);
        const tol_h = route[i].distance / gs;
        route_info.push({
            wind_correction_angle: wca,
            true_heading: th,
            compass_heading: th - variation,
            ground_speed: gs,
            time_on_leg: tol_h * 60,
            fuel_required: tol_h * fuel_consumption,
        });
    }
    return route_info;
}

function weight_of_9196ul(volume) {
    return volume * 0.72;
}

const { createApp, ref, computed } = Vue;
createApp({
    setup() {
        const weight = ref({
            'Front seats': 0,
            'Rear seats': 0,
            'Baggage': 0
        });
        const reg = ref('SE-EMW');
        const aircraft = computed(() => aircraft_data[reg.value]);

        /* Route Information */
        const wind_angle = ref(90);
        const wind_speed = ref(15);
        const variation = ref(7);
        const route = ref([
            {from: 'ESSL', true_track: 170, distance: 6, to: 'VSN'},
        ]);
        const route_info = computed(() =>
            calc_route_info(wind_angle.value, wind_speed.value, variation.value,
                aircraft.value.cruise_speed, aircraft.value.fuel_consumption,
                route.value));
        const time_on_route = computed(() =>
            route_info.value.map((leg) => leg.time_on_leg).reduce((t, acc) => t + acc, 0));
        const total_fuel_required = computed(() =>
            route_info.value.map((leg) => leg.fuel_required).reduce((t, acc) => t + acc, 0));

        /* Weight and Balance */
        const fuel_volume = ref(aircraft.value.max_fuel_volume.toFixed(1));
        const fuel_weight = computed(() => weight_of_9196ul(fuel_volume.value));
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

        return {
            reg,
            aircraft,

            wind_angle,
            wind_speed,
            variation,
            route,
            route_info,
            time_on_route,
            total_fuel_required,

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
        };
    },
}).mount('#app');
