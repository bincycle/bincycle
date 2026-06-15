create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

create trigger on_payment_status_change
  after insert or update of status on payments
  for each row execute procedure sync_pickup_payment_status();
