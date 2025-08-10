# CAR11 Application Requirements

## 1. Vision and Goal
- Modern web application for efficient and seamless corporate fleet management.
- Simplify vehicle reservation for employees.
- Provide comprehensive tools for administrators for oversight and management.
- Expected to function with precision and reliability, comparable to paid commercial products.

## 2. System Access and User Roles
### 2.1. Login and Logout
- Secure login with unique username (email or corporate ID) and password.
- Passwords must be securely stored (not in readable form).
- Easy creation of test users (e.g., "admin" with "adminpass").
- Secure logout to terminate active sessions.

### 2.2. User Roles and Permissions
- **Regular Employee:**
    - View available vehicles and details.
    - Create, edit, and cancel own vehicle reservations.
    - Access and limited editing of personal data.
    - View reservation calendar.
- **Fleet Manager (Administrator):**
    - Full access to all system functions.
    - Complete vehicle management (add, edit, archive).
    - Oversight and management of all reservations.
    - User account and role management.
    - Service record management.
    - Damage record management.
    - Access to detailed reports and overviews.

## 3. Vehicle Management
### 3.1. Vehicle Overview and Details
- Intuitive vehicle list with quick filtering (status, fuel type, transmission).
- Comprehensive vehicle details:
    - Basic info: Make, model, license plate, color, fuel type, seating capacity, transmission.
    - Operational info: Current status, detailed description, odometer reading.
    - Important dates: Last service, next service, technical inspection expiry, highway vignette validity, emission control expiry (easily updatable).
    - Notes: Special notes about vehicle access or specific features.

### 3.2. Vehicle Lifecycle in the System
- **Add New Vehicle:** Easy addition, mandatory fields, unique license plate.
- **Edit Vehicle Information:** All vehicle info, including dates, editable by administrators.
- **Archive Vehicle:** Instead of permanent deletion, archive vehicle to retain historical data (reservations, services, damages). Archived vehicles are not reservable.
- **Availability Check:** Quick and reliable check of vehicle availability for a specific time period.

## 4. Vehicle Reservations
### 4.1. Reservation Overview and Details
- **Personalized Reservation Overview:** Employees see only their own reservations; administrators see all.
- **Flexible Filtering:** Filter by vehicle, reservation status (Confirmed, Canceled, Completed), or time period.
- **Detailed Reservation Information:** Vehicle, user, start/end time, purpose, destination, number of passengers, user notes, admin notes.

### 4.2. Creating and Managing Reservations
- **Easy Reservation Creation:** Select vehicle, enter start/end time, purpose, destination. System checks availability and prevents past reservations. Administrators can create reservations for other users.
- **Flexible Reservation Edits:** Users can edit their own reservations with a time limit (e.g., 2 hours before start). Administrators have full editing freedom, including status changes and internal notes.
- **Cancel Reservation:** Change status to "Canceled" instead of deletion to preserve history. Time limit for regular users.

### 4.3. Calendar View
- **Interactive Calendar:** Visualizes all confirmed reservations for all vehicles. Color-coded by user or vehicle type.

## 5. User and Role Management (Admin Only)
### 5.1. User Overview and Details
- **Complete User List:** Filterable by status (active/inactive) or role.
- **Detailed User Profile:** Corporate ID, full name, email, department, phone, activity status.

### 5.2. User Lifecycle in the System
- **Create New User:** Administrators can add new users and assign roles.
- **Edit User Data:** Administrators have full control. Regular users can edit limited personal contact info.
- **Deactivate User:** Deactivate instead of delete to retain historical data. Deactivated users lose access.

### 5.3. Role Management
- **Role Overview:** View all defined roles.
- **Create and Edit Roles:** Create new roles with names/descriptions, or edit existing ones.
- **Safe Role Deletion:** Prevent deletion if active users are assigned to the role.

## 6. Service Record Management (Admin Only)
### 6.1. Service Record Overview and Details
- **Comprehensive Service List:** Filterable by vehicle.
- **Detailed Service Information:** Date, type (Regular maintenance, Oil change, Brake repair), description, cost, service provider. Linked to specific vehicle.

### 6.2. Service Record Lifecycle
- **Add New Service:** Automatically updates last service date for the vehicle if newer.
- **Edit Service Record:** Edit existing records (e.g., costs, description).
- **Delete Service Record:** Can be deleted.

## 7. Damage Record Management (Admin Only)
### 7.1. Damage Record Overview and Details
- **Clear Damage List:** Filterable by vehicle or repair status (Waiting for repair, Repaired, Irreparable).
- **Detailed Damage Information:** Date, description, estimated cost, actual cost, repair status, option to attach photos. Linked to specific vehicle.

### 7.2. Damage Record Lifecycle
- **Add New Record:** Option to upload and manage damage photos.
- **Edit Damage Record:** Update status, actual costs, add/remove photos.
- **Delete Damage Record:** Can be deleted.

## 8. Reports and Overviews (Admin Only)
### 8.1. Dashboard
- **Dynamic Dashboard:** Real-time key statistics:
    - Total active vehicles.
    - Total active users.
    - Monthly reservations.
    - Vehicles in active reservation.
    - Vehicles currently under maintenance.
    - Service records in last 30 days.
    - Unresolved damage records.
- **Reservation Trend Graph:** Visualizes reservations over last 6 months.

### 8.2. Detailed Reports
- **Vehicle Utilization Report:** Analyzes vehicle usage intensity (total hours reserved, utilization percentage) for a defined period.
- **Cost Analysis Report:** Overview of vehicle operating costs (service costs, actual damage repair costs) for a defined period. Individual and total fleet costs.
- **Reservation Statistics Report:** Detailed reservation statistics:
    - Reservation status breakdown.
    - Top 10 most active users.
    - Top 10 most popular vehicles.
    - Daily reservation overview.

### 8.3. Data Export
- **Export to CSV:** Export data from any report to CSV for external analysis.

## 9. Overall Application Behavior and Quality: Commercial Standards
- **User Interface (UI) and Experience (UX):**
    - Intuitive and Modern Design.
    - Responsive Design (all devices).
    - Smooth and Fast performance.
    - Clear Feedback (success, error, ongoing process messages).
- **Robustness and Reliability:**
    - Error Resilience.
    - Data Consistency (transactional operations).
    - High Availability (24/7).
- **Security:**
    - Comprehensive Access Control.
    - Data Protection (encryption, password hashing).
    - Vulnerability Protection (SQL Injection, XSS, CSRF).
- **Scalability and Maintainability:**
    - Modular Architecture.
    - Easy Maintenance (clean, well-commented code).
- **Logging and Auditing:**
    - Comprehensive Event Logging (login, data changes, security incidents, system errors).

