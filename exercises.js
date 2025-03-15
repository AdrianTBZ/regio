// Mock data
let exercises = [
    {
        id: 1,
        name: "Bench Press",
        description: "Lie on a flat bench with a barbell and push the weight up from your chest.",
        type: "Strength"
    },
    {
        id: 2,
        name: "Squats",
        description: "Lower your body by bending your knees as if you're sitting in a chair, then stand back up.",
        type: "Strength"
    },
    {
        id: 3,
        name: "Treadmill Running",
        description: "Running on a treadmill at a steady pace to improve cardiovascular endurance.",
        type: "Cardio"
    },
    {
        id: 4,
        name: "Pull-ups",
        description: "Hang from a bar and pull your body upward until your chin is above the bar.",
        type: "Strength"
    }
];

const exercisesTable = document.getElementById('exercisesTable');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const exerciseModal = document.getElementById('exerciseModal');
const closeExerciseModal = document.getElementById('closeExerciseModal');
const exerciseModalTitle = document.getElementById('exerciseModalTitle');
const exerciseForm = document.getElementById('exerciseForm');
const exerciseId = document.getElementById('exerciseId');
const exerciseName = document.getElementById('exerciseName');
const exerciseDescription = document.getElementById('exerciseDescription');
const exerciseType = document.getElementById('exerciseType');
const cancelExercise = document.getElementById('cancelExercise');
const saveExercise = document.getElementById('saveExercise');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const progressModal = document.getElementById('progressModal');
const closeProgressModal = document.getElementById('closeProgressModal');
const progressModalTitle = document.getElementById('progressModalTitle');
const closeProgress = document.getElementById('closeProgress');

let exerciseToDelete = null;
let isEditing = false;

function renderExercises() {
    const tbody = exercisesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    exercises.forEach(exercise => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exercise.name}</td>
            <td>${exercise.description}</td>
            <td>${exercise.type}</td>
            <td class="actions">
                <button class="btn" data-id="${exercise.id}" data-action="progress">My Progress</button>
                <button class="btn btn-secondary" data-id="${exercise.id}" data-action="edit">Edit</button>
                <button class="btn btn-danger" data-id="${exercise.id}" data-action="delete">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const actionButtons = tbody.querySelectorAll('button[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleExerciseAction);
    });
}

function handleExerciseAction(e) {
    const action = e.target.getAttribute('data-action');
    const exerciseId = parseInt(e.target.getAttribute('data-id'));
    const exercise = exercises.find(ex => ex.id === exerciseId);
    
    switch(action) {
        case 'progress':
            progressModalTitle.textContent = `Progress: ${exercise.name}`;
            progressModal.style.display = 'flex';
            break;
        case 'edit':
            showExerciseModal(exercise);
            break;
        case 'delete':
            exerciseToDelete = exerciseId;
            deleteModal.style.display = 'flex';
            break;
    }
}

function showExerciseModal(exercise = null) {
    if (exercise) {
        exerciseModalTitle.textContent = 'Edit Exercise';
        exerciseId.value = exercise.id;
        exerciseName.value = exercise.name;
        exerciseDescription.value = exercise.description;
        exerciseType.value = exercise.type;
        isEditing = true;
    } else {
        exerciseModalTitle.textContent = 'Add Exercise';
        exerciseForm.reset();
        exerciseId.value = '';
        isEditing = false;
    }

    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    
    exerciseModal.style.display = 'flex';
}

// Validate exercise form
function validateExerciseForm() {
    let isValid = true;
    
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

    if (!exerciseName.value.trim()) {
        document.getElementById('exerciseNameError').textContent = 'Name is required';
        isValid = false;
    }

    if (!exerciseDescription.value.trim()) {
        document.getElementById('exerciseDescriptionError').textContent = 'Description is required';
        isValid = false;
    }

    if (!exerciseType.value) {
        document.getElementById('exerciseTypeError').textContent = 'Type is required';
        isValid = false;
    }
    
    return isValid;
}

// Save exercise
function saveExerciseData() {
    if (!validateExerciseForm()) {
        return;
    }
    
    const exercise = {
        name: exerciseName.value.trim(),
        description: exerciseDescription.value.trim(),
        type: exerciseType.value
    };
    
    if (isEditing) {
        const id = parseInt(exerciseId.value);
        const index = exercises.findIndex(ex => ex.id === id);
        if (index !== -1) {
            exercise.id = id;
            exercises[index] = exercise;
        }
    } else {
        exercise.id = Math.max(...exercises.map(ex => ex.id), 0) + 1;
        exercises.push(exercise);
    }

    localStorage.setItem('exercises', JSON.stringify(exercises));
    renderExercises();

    exerciseModal.style.display = 'none';
}

addExerciseBtn.addEventListener('click', () => {
    showExerciseModal();
});

closeExerciseModal.addEventListener('click', () => {
    if (confirm('Do you want to close without saving? Any changes will be lost.')) {
        exerciseModal.style.display = 'none';
    }
});

cancelExercise.addEventListener('click', () => {
    if (confirm('Do you want to cancel? Any changes will be lost.')) {
        exerciseModal.style.display = 'none';
    }
});

saveExercise.addEventListener('click', saveExerciseData);

closeDeleteModal.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    exerciseToDelete = null;
});

cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    exerciseToDelete = null;
});

confirmDelete.addEventListener('click', () => {
    if (exerciseToDelete !== null) {
        exercises = exercises.filter(exercise => exercise.id !== exerciseToDelete);
        localStorage.setItem('exercises', JSON.stringify(exercises));
        renderExercises();
        deleteModal.style.display = 'none';
        exerciseToDelete = null;
    }
});

closeProgressModal.addEventListener('click', () => {
    progressModal.style.display = 'none';
});

closeProgress.addEventListener('click', () => {
    progressModal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
        exercises = JSON.parse(savedExercises);
    } else {
        localStorage.setItem('exercises', JSON.stringify(exercises));
    }
    
    renderExercises();
});