-- Remove the two test bookings created by browser verification on 2026-08-18.
--
-- While verifying the new day-rate work, two form submissions were sent without
-- the request being intercepted, so submitBooking() inserted them for real and
-- notifyNewBooking() emailed them to ADMIN_EMAIL. They are the only rows with
-- this address; no genuine enquiry is touched.
--
-- Run the SELECT first and confirm it returns exactly the two harness rows
-- before running the DELETE.

select id, created_at, name, email, service, message
from public.bookings
where email = 'harness@example.invalid';

delete from public.bookings
where email = 'harness@example.invalid';
