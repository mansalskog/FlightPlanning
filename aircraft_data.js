/* Aircraft data obtained from POH. */
const aircraft_data = {
    'SE-MMZ': {
        'cruise_speed': 105, // at sea level, 55% power, 15 degrees OAT
        'fuel_consumption': us_gal_to_l(11.0), // for 75% power, best power mixture
        'climb_vertical_speed': 520, // fpm, at 4000 ft pressure alt., ISA
        'bew': lb_to_kg(1783.48),
        'max_fuel_volume': us_gal_to_l(48),
        'arm': {
            'BEW': in_to_cm(88.34),
            'Front seats': in_to_cm(80.5),
            'Rear seats': in_to_cm(118.1),
            'Baggage': in_to_cm(142.8),
            'Fuel': in_to_cm(95.0),
        },
        'atc_equipment': '/S',
        'atc_other_info': '',
        'atc_survival_info': 'R/E A/WR', // ELT available, no portable UHF/VHF, aircraft colour white and red
    },
    'SE-LRL': {
        'cruise_speed': 105, // at sea level, 55% power, 15 degrees OAT
        'fuel_consumption': us_gal_to_l(11.0), // for 75% power, best power mixture
        'climb_vertical_speed': 520, // fpm, at 4000 ft pressure alt., ISA
        'bew': lb_to_kg(1590.0), // TODO double check this
        'max_fuel_volume': us_gal_to_l(0),
        'arm': {
            'BEW': in_to_cm(87.5), // TODO double check this
            'Front seats': in_to_cm(80.5),
            'Rear seats': in_to_cm(118.1),
            'Baggage': in_to_cm(142.8),
            'Fuel': in_to_cm(95.0),
        },
        'atc_equipment': 'BDFGLORY/S',
        'atc_other_info': 'PBN/D2S1',
        'atc_survival_info': 'R/E A/WB', // ELT available, no portable UHF/VHF, aircraft colour white and blue
    },
    'SE-IUD': {
        'cruise_speed': 95, // at sea level, 55% power, 15 degrees OAT
        'fuel_consumption': us_gal_to_l(10.5), // for 75% power, best power mixture
        'climb_vertical_speed': 530, // fpm, at 4000 ft pressure alt., ISA
        'bew': lb_to_kg(1607.2),
        'max_fuel_volume': us_gal_to_l(48),
        'arm': {
            'BEW': in_to_cm(87.4),
            'Front seats': in_to_cm(80.5),
            'Rear seats': in_to_cm(118.1),
            'Baggage': in_to_cm(142.8),
            'Fuel': in_to_cm(95.0),
        },
        'atc_equipment': 'BDFGLORY/S',
        'atc_other_info': 'PBN/D2S1',
        'atc_survival_info': 'R/E A/WR', // ELT available, no portable UHF/VHF, aircraft colour white and red
    },
    'SE-KIT': { // NOTE: SE-KIT uses same data as SE-IUD (except for atc_ fields), full POH not avail.
        'cruise_speed': 95, // at sea level, 55% power, 15 degrees OAT
        'fuel_consumption': us_gal_to_l(10.5), // for 75% power, best power mixture
        'climb_vertical_speed': 530, // fpm, at 4000 ft pressure alt., ISA
        'bew': lb_to_kg(1607.2),
        'max_fuel_volume': us_gal_to_l(48),
        'arm': {
            'BEW': in_to_cm(87.4),
            'Front seats': in_to_cm(80.5),
            'Rear seats': in_to_cm(118.1),
            'Baggage': in_to_cm(142.8),
            'Fuel': in_to_cm(95.0),
        },
        'atc_equipment': 'BDFGLORY/S',
        'atc_other_info': 'PBN/D2S1',
        'atc_survival_info': 'R/E A/WB', // ELT available, no portable UHF/VHF, aircraft colour white and blue
    },
    'SE-KMH': {
        'cruise_speed': 90, // at sea level, 55% power, 15 degrees OAT
        'fuel_consumption': us_gal_to_l(10), // for 75% power, best power mixture
        'climb_vertical_speed': 360, // from POH figure 5-17, seems very low? TODO check again
        'bew': lb_to_kg(1464.9),
        'max_fuel_volume': us_gal_to_l(48),
        'arm': {
            'BEW': in_to_cm(84.2),
            'Front seats': in_to_cm(80.5),
            'Rear seats': in_to_cm(118.1),
            'Baggage': in_to_cm(142.8),
            'Fuel': in_to_cm(95.0),
        },
        'atc_equipment': 'DFGLORY/S',
        'atc_other_info': 'PBN/D2S1',
        'atc_survival_info': 'R/E A/WB', // ELT available, no portable UHF/VHF, aircraft colour white and blue
    },
    'SE-EMW': {
        'cruise_speed': mph_to_kt(134), // at sea level, 75% power, ISA OAT (55% power not avail.)
        'fuel_consumption': us_gal_to_l(10.0), // for 75% power, best power mixture
        'climb_vertical_speed': 600, // from POH page 22, seems very high? TODO check again
        'bew': 648.9,
        'max_fuel_volume': us_gal_to_l(50),
        'arm': {
            'BEW': 215.9,
            'Front seats': 217.2,
            'Rear seats': 300.0,
            'Baggage': 362.7,
            'Fuel': 241.3,
        },
        'atc_equipment': 'not avail.',
        'atc_other_info': 'not avail.',
        'atc_survival_info': 'R/E A/WB', // ELT available, no portable UHF/VHF, aircraft colour white and blue
    },
};
