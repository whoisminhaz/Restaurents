# Original User Request

## 2026-06-12T10:26:04Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval
> Goal: Get user approval → delegate to teamwork_preview

An overhaul of the restaurant reservation system on the demo branch to include capacity limits, unique alphanumeric reservation IDs, pre-order enforcement modes, dynamic routing of booking tickets, and a comprehensive booking management interface for customers.

Working directory: f:\All restaurents\master-restaurant-template
Integrity mode: development

## Requirements

### R1. Admin Dashboard Settings Updates
Add a setting for "Maximum capacity per hour" alongside the existing reservation rules in the dashboard settings. Enhance the global toggles to control booking system modes (Disabled, Enabled without mandatory pre-ordering, Enabled with mandatory pre-ordering).

### R2. Booking Flow & Capacity Checking
Modify the customer booking page to respect the three system modes. In enabled modes, validate requested slots against the maximum hourly capacity (confirmed reservations + requested guests). Provide clear feedback when fully booked or when reservations are globally disabled. If pre-ordering is mandatory, route directly to the menu.

### R3. Unique Reservation IDs and Lifecycle
Generate a random alphanumeric reservation ID (e.g., "AK649") upon request submission and display it prominently to the user. All tickets must carry this ID throughout their lifecycle from Pending -> Confirmed/Assigned -> Scheduled -> Live Orders -> Completed.

### R4. Customer Booking Management
Enhance the "Manage Booking" section to require both a booked date AND either a phone number or Reservation ID. Display current status (Pending, Confirmed with Table Number, Cancelled, Completed). Provide a "Cancel Booking" button that is only active if the reservation time is more than 1 hour away.

### R5. Cancellation & Ticket Routing Logic
When a customer cancels, generate a "Booking Cancellation" alert ticket in the owner's Live Orders section. Once acknowledged by the owner, archive all associated tickets to "Completed".
Update the owner workflow: Confirmed bookings with >1 hour remaining go to Scheduled; <1 hour go to Live Orders. Use dynamic UI filtering in the dashboard to show Scheduled tickets where time > 1 hour, and Live tickets where time < 1 hour. No background data movement is required.

## Acceptance Criteria

### Booking Modes
- [ ] When reservations are disabled, the booking page shows "Sorry, We are not taking Reservations Now!!" and blocks entry.
- [ ] When reservations are enabled (pre-order optional), users are asked if they want to pre-order after submitting booking info.
- [ ] When reservations are enabled (pre-order mandatory), users are forced to the menu page immediately after booking info submission.

### Capacity Management
- [ ] The system accurately prevents bookings if existing confirmed guests + requested guests exceed the hourly capacity.

### Booking Management & Cancellation
- [ ] Customers can retrieve their booking using Date + (Phone or ID).
- [ ] Customers can cancel their booking if the scheduled time is >1 hour away.
- [ ] Cancellations appear as priority alerts in the Live Orders dashboard and move to Completed upon owner confirmation.

### Workflow & Routing
- [ ] New bookings appear in the Reservations tab.
- [ ] Approving a booking requires assigning a Table Number.
- [ ] Approved bookings are correctly filtered dynamically to Scheduled (if >1 hour) or Live Orders (if <1 hour).

## Verification Resources
- The agent must test these workflows by running the React app locally (`npm run dev`) and verifying the customer flow and dashboard reflections directly in the UI.
