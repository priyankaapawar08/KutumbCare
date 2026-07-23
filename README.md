## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/your-username/kutumbcare.git
   cd kutumbcare
```

2. **Set up the backend**
```bash
   cd backend
   npm install
```

3. **Set up the frontend**
```bash
   cd ../frontend
   npm install
```

### Running the App

**Start the backend server:**
```bash
cd backend
npm start
```
The backend runs on `http://localhost:5000`

**Start the frontend:**
```bash
cd frontend
npm start
```
The frontend runs on `http://localhost:3000`

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Family Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all family members |
| POST | `/api/members` | Add a new family member |

### Vitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vitals/member/:memberId` | Get vitals for a member |
| POST | `/api/vitals` | Add a new vital sign |
| DELETE | `/api/vitals/:id` | Delete a vital record |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medications/member/:memberId` | Get medications for a member |
| POST | `/api/medications` | Add a new medication |
| PUT | `/api/medications/:id` | Update a medication |
| DELETE | `/api/medications/:id` | Delete a medication |
| PATCH | `/api/medications/:id/toggle` | Toggle active status |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/member/:memberId` | Get appointments for a member |
| POST | `/api/appointments` | Add a new appointment |
| DELETE | `/api/appointments/:id` | Delete an appointment |
| PATCH | `/api/appointments/:id/status` | Update appointment status |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminders/taken` | Mark a medication as taken |
| GET | `/api/reminders/status/:medicationId/:timing/:date` | Check if a dose was taken |
| GET | `/api/reminders/streak/:medicationId` | Get streak data for a medication |
| GET | `/api/reminders/history/:medicationId` | Get reminder history |

> All routes except `/api/auth/*` require a valid JWT in the `Authorization: Bearer <token>` header.

## 📸 Screenshots

### Authentication
| Login | Signup |
|---|---|
| ![Login Page](./screenshots/login%20page.png) | ![Signup](./screenshots/signup.png) |

### Dashboard
![Dashboard](./screenshots/dashboard1.png)

### Family Members
| Add Member | Member Form | Member Profile |
|---|---|---|
| ![Add Member](./screenshots/add%20member.png) | ![Member Form](./screenshots/member%20form.png) | ![Member Profile](./screenshots/member%20profile.png) |

| Member Deletion |
|---|
| ![Member Deleted](./screenshots/member%20deleted.png) |

### Vital Signs
| Vital Form | Vital Added |
|---|---|
| ![Vital Form](./screenshots/vital%20form.png) | ![Vital Added](./screenshots/vital%20added.png) |

### Medications
| Medication Dashboard | Medication Form |
|---|---|
| ![Medication Dashboard](./screenshots/medication%20dashboard.png) | ![Medication Form](./screenshots/medication%20form.png) |

| Medication Profile | Medication Added |
|---|---|
| ![Medication Profile](./screenshots/medication%20profile.png) | ![Medication Added](./screenshots/medication%20added.png) |

### Appointments
| Appointment Form | Appointment Added |
|---|---|
| ![Appointment Form](./screenshots/appointment%20form.png) | ![Appointment Added](./screenshots/appointment%20added.png) |

| Appointment Profile |
|---|
| ![Appointment Profile](./screenshots/appointment%20profile.png) |

### Medical Documents
| Document Form | Document Added |
|---|---|
| ![Med Docs Form](./screenshots/med%20docs%20form.png) | ![Med Docs Added](./screenshots/med%20docs%20added.png) |

## 🔮 Future Enhancements

- [ ] Move family member data fully to backend (currently partially localStorage-based)
- [ ] Email/SMS medication reminders
- [ ] Calendar view for appointments and medication schedules
- [ ] Health reports export (PDF)
- [ ] Lifestyle predictor enhancements
- [ ] Mobile app version
- [ ] Multi-language support

## 👩‍💻 Author

**Priyanka** — Final Year Computer Engineering Student, VP's Kamalnayan Bajaj Institute of Engineering and Technology

## 📄 License

This project is created for academic purposes.

---

*Built with ❤️ for families who care about health.*