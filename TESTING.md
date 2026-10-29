# Complete Application Testing Guide

This guide walks you through the complete end-to-end workflow of the Automated Exam Seating System.

## Prerequisites
- Node.js and MongoDB installed
- Dependencies installed: `npm run install:all`
- Environment configured (see INSTALLATION.md)
- Seed data loaded: `npm run seed`

---

## Step 1: Start the Application

```bash
# Terminal 1 - Start backend and frontend
npm run dev

# Or start separately:
npm run server    # Backend: http://localhost:5000
npm run client    # Frontend: http://localhost:5173
```

Wait for both services to start successfully.

---

## Step 2: Verify Home Page

1. Open browser: `http://localhost:5173`
2. You should see:
   - SIMATS Engineering branding
   - "Automated Exam Seating System" heading
   - Three exam type buttons: Theory Exams, Lab Exams, Govt Exams
   - Feature cards describing the system
   - "Admin Login" button in top-right

✅ **Expected Result**: Beautiful institutional-styled landing page loads

---

## Step 3: Admin Login

1. Click "Admin Login" button
2. Login form appears with:
   - Email field
   - Password field
   - Login/Register tabs
3. Enter credentials:
   - Email: `admin@college.edu`
   - Password: `Admin@123`
4. Click "Login"

✅ **Expected Result**: Redirected to Dashboard page

---

## Step 4: Dashboard Overview

1. Dashboard displays:
   - **4 Main Cards**: Total Students, Total Exams, Total Halls, Total Branches
   - **4 Status Cards**: Allocated Seats, Available Seats, Unallocated Students, Conflicts
   - **Chart 1**: Students by Branch (bar chart showing distribution)
   - **Chart 2**: Hall Occupancy
   - **Chart 3**: Allocated vs Available Seats (pie chart)
   - **Chart 4**: Exam Distribution

Expected values (from seed data):
- Total Students: 450
- Total Branches: 5
- Total Exams: 50+
- Total Halls: 12

✅ **Expected Result**: All metrics display correctly

---

## Step 5: Sidebar Navigation

Left sidebar shows:
- 📊 Dashboard
- 👥 Students
- 📝 Exams
- 🏛️ Halls
- ⚙️ Allocation
- 📋 Reports
- ⚙️ Settings
- Logout

Click through each page to verify they load.

---

## Step 6: Student Management

### View Students
1. Click "Students" in sidebar
2. Page displays:
   - Search box
   - Filter by branch dropdown
   - Pagination controls
   - Table with: Reg No, Name, Branch, Year, Section
3. Try searching for a student by register number

### Add a Student
1. Click "+ Add Student" button
2. Form appears with fields:
   - Register Number (required)
   - Name (required)
   - Branch (dropdown)
   - Year
   - Section
   - Email
3. Fill in test data:
   ```
   Register No: TEST001
   Name: Test Student
   Branch: CSE
   Year: 3
   Section: A
   Email: test@college.edu
   ```
4. Click "Create Student"

✅ **Expected Result**: Success message, student appears in list

### Delete a Student
1. Find the student you just created in the list
2. Click the delete icon (trash)
3. Confirm deletion

✅ **Expected Result**: Student removed from list

---

## Step 7: Bulk CSV Import

1. Click "Students" → "Import Students" tab
2. Prepare a CSV file with columns:
   ```
   Register Number, Name, Branch, Year, Section, Email
   TEST002, Student Two, ECE, 3, A, test2@college.edu
   TEST003, Student Three, MECH, 3, B, test3@college.edu
   ```
3. Drag and drop CSV file or click to select
4. Preview shows:
   - Detected records
   - Valid records
   - Invalid records (if any)
5. Click "Confirm Import"

✅ **Expected Result**: Success message, students imported into database

---

## Step 8: Exam Management

1. Click "Exams" in sidebar
2. Form appears with fields:
   - Exam Name
   - Exam Type (Theory/Lab/Other)
   - Subject
   - Date
   - Start Time / End Time
   - Academic Year
   - Semester
3. Create a test exam:
   ```
   Exam Name: Test Theory Exam
   Type: Theory Exam
   Subject: Computer Networks
   Date: 2026-09-30
   Time: 10:00 - 12:00
   Academic Year: 2026-2027
   Semester: 5
   ```
4. Click "Create Exam"
5. Table shows all exams with columns: Exam, Subject, Date, Timing, Action

✅ **Expected Result**: Exam appears in list

---

## Step 9: Hall Management

1. Click "Halls" in sidebar
2. Form appears with fields:
   - Room Number
   - Block (A/B/C)
   - Rows
   - Columns
   - (Capacity auto-calculates)
3. Create a test hall:
   ```
   Room Number: TEST101
   Block: A
   Rows: 5
   Columns: 6
   ```
4. Click "Create Hall"
5. Table shows: Name, Room Number, Block, Rows, Columns, Capacity

✅ **Expected Result**: Hall created with auto-calculated capacity (30 seats)

---

## Step 10: Generate Seating Plan

1. Click "Allocation" in sidebar
2. "Generate Seating Plan" form appears with:
   - Select Exam dropdown
   - Exam Type dropdown
   - Timing radio buttons (FN/AN)
   - Hall selection checkboxes
3. Select options:
   - Choose an exam from dropdown
   - Keep "Theory Exam" type
   - Select "FN" timing
   - Check at least 3 halls
4. Review stats:
   - Total Students: 450
   - Total Seats Available: (calculated from selected halls)
5. Click "Generate Seating Plan"

⏳ **Wait**: Algorithm runs (should take 5-10 seconds)

✅ **Expected Result**: 
- Screen shows "Seating plan generated successfully!"
- Metrics cards display:
  - Total Students: 450
  - Allocated: 450 (or close to it)
  - Unallocated: 0 (or small number if not enough seats)
  - Conflicts: Single-digit number (ideally < 10)

---

## Step 11: View Seating Arrangement

After generation, the page shows:

1. **Export Section**:
   - Export CSV button
   - Export Excel button
   - Export PDF button
   - Print button

2. **Seating Grids**:
   - For each selected hall
   - Grid shows:
     - Seat numbers
     - Student register numbers
     - Branch color-coding:
       - CSE: Blue
       - ECE: Green
       - MECH: Purple
       - EEE: Orange
       - CIVIL: Red
   - Can hover over seat to see full details

✅ **Expected Result**: Visual seating grids display all allocated students

---

## Step 12: Export Seating Plan

1. From seating view, click "Export CSV"

✅ **Expected Result**: 
- `seating-plan-[examId].csv` file downloads
- Open CSV and verify it contains columns: Reg No, Name, Branch, Exam, Room, Block, Seat

### Export Excel
1. Click "Export Excel"

✅ **Expected Result**:
- `seating-plan-[examId].xlsx` file downloads
- Formatted spreadsheet with all seating data

### Export PDF
1. Click "Export PDF"

✅ **Expected Result**:
- PDF downloads with formatted report
- Headers: Institution name, exam details, date
- Detailed seating table

### Print
1. Click "Print"

✅ **Expected Result**:
- Browser print dialog opens
- Preview shows formatted seating plan
- Can print to PDF or paper

---

## Step 13: View Reports

1. Click "Reports" in sidebar
2. Page displays:
   - Exam selector dropdown
   - Branch filter dropdown
   - Search box (by register no or name)
   - 4 stat cards:
     - Total Seating Plans
     - Filtered Results
     - Branches
     - Halls Used
   - Large table with columns:
     - Reg No, Name, Branch, Exam, Subject, Block, Room, Seat, Row, Column

3. Try filtering:
   - Select branch from dropdown → table filters
   - Search for register number → finds student
   - Export CSV/Excel/PDF from top

✅ **Expected Result**: 
- Filtering works instantly
- Export buttons download properly formatted files
- Search finds correct students

---

## Step 14: Test Real-Time Features

### In Two Browser Windows

1. **Window 1**: Open `http://localhost:5173` and login
2. **Window 2**: Open same URL in private/incognito window, login as same admin
3. **Window 1**: Go to Students page
4. **Window 2**: Go to Students page
5. **Window 1**: Create a new student
6. **Window 2**: Page should auto-update without refresh (if Socket.IO working)

✅ **Expected Result**: New student appears in Window 2's student list automatically

---

## Step 15: Verify Error Handling

### Test Case 1: Duplicate Register Number
1. Try to create student with register number that already exists
2. Should see error: "Duplicate register number"

✅ **Expected Result**: Proper error message displayed

### Test Case 2: Insufficient Seats
1. Create an exam
2. Select only 1 hall with 30 seats
3. Try to allocate (with 450 students)
4. Should see error: "Allocation cannot be completed. Required seats: 450. Available seats: 30..."

✅ **Expected Result**: Helpful error message

### Test Case 3: Empty Student List
1. Delete all students from database
2. Try to generate seating
3. Should see error: "Student list is empty"

✅ **Expected Result**: Proper error handling

---

## Step 16: Performance Testing

### Large Dataset
- Seed data includes 450 students
- Allocation should complete in under 30 seconds
- Page remains responsive during generation

✅ **Expected Result**: 
- Loading indicator shows progress
- UI doesn't freeze
- Allocation completes successfully

### Report Generation
- Export of 450 seating records should complete in < 5 seconds

✅ **Expected Result**: File downloads quickly

---

## Step 17: Responsive Design Testing

### On Desktop (1920x1080)
- All elements display properly
- Tables fully visible
- Buttons accessible

### On Tablet (768x1024)
1. Sidebar collapses or becomes hamburger menu
2. Tables scroll horizontally if needed
3. Forms stack properly

### On Mobile (375x667)
1. Navigation becomes hamburger menu
2. All forms are single-column
3. Seating grids are scrollable

✅ **Expected Result**: Layout adapts at each breakpoint

---

## Troubleshooting

### Issue: "Failed to load data"
**Solution**: 
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check browser console for errors

### Issue: Seating plan shows "No seating plans available"
**Solution**:
- Ensure you generated seating first
- Check exam ID in URL matches generated exam
- Try refreshing page

### Issue: Export buttons don't work
**Solution**:
- Check API endpoints are accessible
- Verify backend is running on port 5000
- Check browser console for CORS errors

### Issue: Students not importing
**Solution**:
- Verify CSV has correct columns
- Check file encoding is UTF-8
- Check CSV format is valid

### Issue: Socket.IO not updating in real-time
**Solution**:
- Check client and server are on same network
- Verify Socket.IO connection in browser console
- Check firewall isn't blocking WebSocket

---

## Key Metrics to Verify

| Metric | Expected Value | Verification |
|--------|----------------|--------------|
| Total Students | 450 | Dashboard card |
| Total Branches | 5 | Dashboard card |
| Total Exams | 50+ | Exams page table |
| Total Halls | 12 | Halls page table |
| Total Seat Capacity | 400+ | Sum of all hall capacities |
| Allocation Success Rate | 95%+ | Allocated >= 450 or available seats |
| Average Conflicts | < 10 | Metrics after generation |
| Export Speed | < 5 sec | Time to download report |
| Page Load Time | < 2 sec | Network tab in DevTools |

---

## Success Criteria

✅ All the following should work:

1. ✅ Home page displays beautifully
2. ✅ Login works with provided credentials
3. ✅ Dashboard shows accurate metrics
4. ✅ Students can be added individually
5. ✅ Bulk CSV import works
6. ✅ Exams can be created
7. ✅ Halls can be created
8. ✅ Seating allocation completes successfully
9. ✅ Seating grids display correctly
10. ✅ Exports work (CSV, Excel, PDF)
11. ✅ Reports can be searched and filtered
12. ✅ Real-time updates work (if testing with multiple windows)
13. ✅ Error messages are helpful and clear
14. ✅ Responsive design works on mobile/tablet
15. ✅ No console errors

---

## Demo Script (5 Minute Walkthrough)

For quick demonstration:

1. **Start App** (1 min)
   - Run `npm run dev`
   - Show home page

2. **Login** (30 sec)
   - Show login form
   - Login successfully

3. **Dashboard** (1 min)
   - Show metrics
   - Show charts

4. **Create & Allocate** (2 min)
   - Create exam (30 sec)
   - Create hall (30 sec)
   - Generate seating (1 min)
   - Show results

5. **Export** (30 sec)
   - Export to Excel
   - Show file

Total: ~5 minutes for complete demo

---

## Conclusion

If all above tests pass, the application is ready for production deployment and demonstration to stakeholders.

For any issues, refer to INSTALLATION.md or contact development team.

**Version**: 1.0.0  
**Last Updated**: 2026-08-30  
**Status**: Complete and Tested
