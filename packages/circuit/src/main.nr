pub fn main(input: u8) -> pub bool {
    input >= 20
}

#[test]
fn test_main_with_valid_age() {
    let result = main(20);
    assert(result == true);
}

#[test]
fn test_main_with_invalid_age() {
    let result = main(19);
    assert(result == false);
}

#[test]
fn test_main_with_zero() {
    let result = main(0);
    assert(result == false);
}

#[test]
fn test_main_with_200() {
    let result = main(200);
    assert(result == true);
}
