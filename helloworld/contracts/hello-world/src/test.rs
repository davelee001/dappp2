#![cfg(test)]

use super::*; // brings GuestbookContract & Client from lib.rs

use soroban_sdk::{
    Env,
    Address,
    String,
    testutils::Address as _, // enables Address::generate()
};

#[test]
fn test_add_message() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    env.mock_all_auths();

    let user = Address::generate(&env);
    client.add_message(&user, &String::from_str(&env, "Hello Stellar"));

    let messages = client.get_messages();
    assert_eq!(messages.len(), 1);
    assert_eq!(messages.get(0).unwrap().content, String::from_str(&env, "Hello Stellar"));
    assert_eq!(messages.get(0).unwrap().user, user);
}

#[test]
fn test_add_multiple_messages() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    env.mock_all_auths();

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    client.add_message(&user1, &String::from_str(&env, "First message"));
    client.add_message(&user2, &String::from_str(&env, "Second message"));
    client.add_message(&user1, &String::from_str(&env, "Third message"));

    let messages = client.get_messages();
    assert_eq!(messages.len(), 3);
    
    assert_eq!(messages.get(0).unwrap().content, String::from_str(&env, "First message"));
    assert_eq!(messages.get(1).unwrap().content, String::from_str(&env, "Second message"));
    assert_eq!(messages.get(2).unwrap().content, String::from_str(&env, "Third message"));
}

#[test]
fn test_get_total_messages() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    env.mock_all_auths();

    assert_eq!(client.get_total_messages(), 0);

    let user = Address::generate(&env);
    client.add_message(&user, &String::from_str(&env, "Message 1"));
    assert_eq!(client.get_total_messages(), 1);

    client.add_message(&user, &String::from_str(&env, "Message 2"));
    assert_eq!(client.get_total_messages(), 2);
}

#[test]
fn test_empty_guestbook() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    let messages = client.get_messages();
    assert_eq!(messages.len(), 0);
    assert_eq!(client.get_total_messages(), 0);
}

#[test]
fn test_long_message() {
    let env = Env::default();
    let contract_id = env.register(GuestbookContract, ());
    let client = GuestbookContractClient::new(&env, &contract_id);

    env.mock_all_auths();

    let user = Address::generate(&env);
    let long_message = "This is a very long message to test that the guestbook can handle longer content without any issues!";
    client.add_message(&user, &String::from_str(&env, long_message));

    let messages = client.get_messages();
    assert_eq!(messages.get(0).unwrap().content, String::from_str(&env, long_message));
}
