extern crate base64;

use regex::Regex;

#[derive(Clone, Debug)]
pub struct AuthenticationFailed;
impl warp::reject::Reject for AuthenticationFailed {}

fn get_basic_username() -> String {
    std::env::var("BASIC_AUTH_USERNAME").expect("Set env variable BASIC_AUTH_USERNAME first!")
}

fn get_basic_password() -> String {
    std::env::var("BASIC_AUTH_PASSWORD").expect("Set env variable BASIC_AUTH_PASSWORD first!")
}

fn auth_is_correct(username: String, password: String) -> bool {
    username == get_basic_username() && password == get_basic_password()
}

fn extract_auth_from_header(auth_header: String) -> Option<String> {
    let re = Regex::new(r"^Basic\s(?P<encoded_credentials>[-A-Za-z0-9+/]*={0,3})$").unwrap();

    if let Some(caps) = re.captures(&auth_header) {
        match caps.name("encoded_credentials") {
            Some(creds) => Some(creds.as_str().to_string()),
            _ => None,
        }
    } else {
        None
    }
}

fn extract_credentials_from_base64_string(encoded_credentials: String) -> Option<(String, String)> {
    if let Ok(credentials) = base64::decode(encoded_credentials) {
        let re = Regex::new(r"^(?P<username>\w+):(?P<password>\w+)$").unwrap();
        match re.captures(std::str::from_utf8(&credentials).unwrap_or("")) {
            Some(caps) => {
                if let (Some(username), Some(password)) =
                    (caps.name("username"), caps.name("password"))
                {
                    Some((username.as_str().to_string(), password.as_str().to_string()))
                } else {
                    None
                }
            }
            None => None,
        }
    } else {
        None
    }
}

pub fn attempt_basic_auth(auth_header: String) -> bool {
    if let Some(base64) = extract_auth_from_header(auth_header) {
        if let Some((username, password)) = extract_credentials_from_base64_string(base64) {
            auth_is_correct(username, password)
        } else {
            false
        }
    } else {
        false
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use test_case::test_case;

    #[test]
    fn get_basic_username_works() {
        std::env::set_var("BASIC_AUTH_USERNAME", "username");
        assert_eq!(get_basic_username(), "username".to_string());
    }

    #[test]
    fn get_basic_password_works() {
        std::env::set_var("BASIC_AUTH_PASSWORD", "password");
        assert_eq!(get_basic_password(), "password".to_string());
    }

    #[test]
    fn check_auth_works() {
        std::env::set_var("BASIC_AUTH_USERNAME", "username");
        std::env::set_var("BASIC_AUTH_PASSWORD", "password");
        assert_eq!(
            auth_is_correct("username".to_owned(), "password".to_owned()),
            true
        );
        assert_eq!(
            auth_is_correct("not_username".to_owned(), "password".to_owned()),
            false
        );
        assert_eq!(
            auth_is_correct("username".to_owned(), "not_password".to_owned()),
            false
        );
    }

    #[test_case("Weird String", None)]
    #[test_case("dXNlcm5hbWU6cGFzc3dvcmQ=", Some(("username".to_string(), "password".to_string())))]
    fn extracting_credentials_works(input: &str, output: Option<(String, String)>) {
        assert_eq!(
            extract_credentials_from_base64_string(input.to_string()),
            output
        );
    }

    #[test_case("Basic abcdef", Some("abcdef".to_string()))]
    #[test_case("Basic abcde===", Some("abcde===".to_string()))]
    #[test_case("Not an auth string", None)]
    fn extracting_base64_creds_works(input: &str, output: Option<String>) {
        assert_eq!(extract_auth_from_header(input.to_string()), output);
    }

    #[test_case("Basic dXNlcm5hbWU6cGFzc3dvcmQ=".to_string(), true)]
    #[test_case("Bearer dXNlcm5hbWU6cGFzc3dvcmQ=".to_string(), false)]
    #[test_case("".to_string(), false)]
    fn attempt_basic_auth_works(input: String, output: bool) {
        std::env::set_var("BASIC_AUTH_USERNAME", "username");
        std::env::set_var("BASIC_AUTH_PASSWORD", "password");
        assert_eq!(attempt_basic_auth(input), output);
    }
}
