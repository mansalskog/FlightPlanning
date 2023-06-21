/* Unit conversion functions. */
function lb_to_kg(lbs) {
    return lbs * 0.45359237;
}

function in_to_cm(ins) {
    return ins * 2.54;
}

function us_gal_to_l(gals) {
    return gals * 3.785411784;
}

function mph_to_kt(mphs) {
    return mphs * 1609.344 / 1852;
}

function deg_to_rad(degs) {
    return degs * Math.PI / 180;
}

function rad_to_deg(rads) {
    return rads * 180 / Math.PI;
}
