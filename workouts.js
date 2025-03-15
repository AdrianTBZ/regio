// Mock data
let workouts = [
    {
        id: 1,
        name: "Full Body Workout",
        startDateTime: "2025-03-10T10:00:00",
        endDateTime: "2025-03-10T11:30:00",
        exercises: [
            { exerciseId: 1, sets: 3, reps: [12, 10, 8] },
            { exerciseId: 3, sets: 4, reps: [15, 12, 10, 8] }
        ]
    },
    {
        id: 2,
        name: "Upper Body Focus",
        startDateTime: "2025-03-12T15:00:00",
        endDateTime: "2025-03-12T16:15:00",
        exercises: [
            { exerciseId: 2, sets: 3, reps: [10, 8, 6] },
            { exerciseId: 4, sets: 3, reps: [12, 10, 8] }
        ]
    }
];

const workoutsTable = document.getElementById('workoutsTable');
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

let workoutToDelete = null;

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

function calculateDuration(startDateTime, endDateTime) {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

function renderWorkouts() {
    const tbody = workoutsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    workouts.forEach(workout => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${workout.name}</td>
            <td>${formatDateTime(workout.startDateTime)}</td>
            <td>${formatDateTime(workout.endDateTime)}</td>
            <td>${calculateDuration(workout.startDateTime, workout.endDateTime)}</td>
            <td class="actions">
                <button class="btn" data-id="${workout.id}" data-action="view">View</button>
                <button class="btn btn-secondary" data-id="${workout.id}" data-action="edit">Edit</button>
                <button class="btn btn-danger" data-id="${workout.id}" data-action="delete">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    const actionButtons = tbody.querySelectorAll('button[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleWorkoutAction);
    });
}

function handleWorkoutAction(e) {
    const action = e.target.getAttribute('data-action');
    const workoutId = parseInt(e.target.getAttribute('data-id'));
    
    switch(action) {
        case 'view':
            window.location.href = `view-workout.html?id=${workoutId}`;
            break;
        case 'edit':
            window.location.href = `edit-workout.html?id=${workoutId}`;
            break;
        case 'delete':
            workoutToDelete = workoutId;
            deleteModal.style.display = 'flex';
            break;
    }
}

addWorkoutBtn.addEventListener('click', () => {
    window.location.href = 'add-workout.html';
});

closeDeleteModal.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    workoutToDelete = null;
});

cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    workoutToDelete = null;
});

confirmDelete.addEventListener('click', () => {
    if (workoutToDelete !== null) {
        workouts = workouts.filter(workout => workout.id !== workoutToDelete);
        renderWorkouts();
        deleteModal.style.display = 'none';
        workoutToDelete = null;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderWorkouts();
    
    localStorage.setItem('workouts', JSON.stringify(workouts));
});

window.addEventListener('load', () => {
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
        workouts = JSON.parse(savedWorkouts);
        renderWorkouts();
    }
});