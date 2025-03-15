const workoutForm = document.getElementById('workoutForm');
const workoutName = document.getElementById('workoutName');
const startDateTime = document.getElementById('startDateTime');
const endDateTime = document.getElementById('endDateTime');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const exercisesList = document.getElementById('exercisesList');
const cancelBtn = document.getElementById('cancelBtn');
const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');

const exerciseModal = document.getElementById('exerciseModal');
const closeExerciseModal = document.getElementById('closeExerciseModal');
const exerciseSelect = document.getElementById('exerciseSelect');
const exerciseSets = document.getElementById('exerciseSets');
const repsContainer = document.getElementById('repsContainer');
const cancelExerciseBtn = document.getElementById('cancelExerciseBtn');
const addExerciseToWorkoutBtn = document.getElementById('addExerciseToWorkoutBtn');

let workoutId = null;
let workoutExercises = [];
let exercises = [];
let editingExerciseIndex = -1;

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');


function loadExercises() {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
        exercises = JSON.parse(savedExercises);

        exerciseSelect.innerHTML = '';
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            exerciseSelect.appendChild(option);
        });
    } else {
        console.log('No exercises found in localStorage');
    }
}

// Load workout data
function loadWorkout() {
    if (!id) {
        alert('No workout ID specified');
        window.location.href = 'index.html';
        return;
    }
    
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
        const workouts = JSON.parse(savedWorkouts);
        const workout = workouts.find(w => w.id === parseInt(id));
        
        if (workout) {
            workoutId = workout.id;
            workoutName.value = workout.name;
            startDateTime.value = workout.startDateTime.slice(0, 16);
            endDateTime.value = workout.endDateTime.slice(0, 16);

            workoutExercises = [];
            workout.exercises.forEach(workoutExercise => {
                const exercise = exercises.find(e => e.id === workoutExercise.exerciseId);
                if (exercise) {
                    workoutExercises.push({
                        id: exercise.id,
                        name: exercise.name,
                        sets: workoutExercise.sets,
                        reps: workoutExercise.reps
                    });
                }
            });
            
            renderExercisesList();
        } else {
            alert('Workout not found');
            window.location.href = 'index.html';
        }
    } else {
        alert('No workouts found');
        window.location.href = 'index.html';
    }
}

function generateRepInputs(sets, existingReps = []) {
    repsContainer.innerHTML = '';
    
    for (let i = 0; i < sets; i++) {
        const defaultValue = i < existingReps.length ? existingReps[i] : 10;
        
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `reps${i+1}`);
        label.textContent = `Set ${i+1}`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `reps${i+1}`;
        input.className = 'form-control';
        input.value = defaultValue;
        input.min = 1;
        input.max = 100;
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        repsContainer.appendChild(formGroup);
    }
}

// Render the exercises list
function renderExercisesList() {
    exercisesList.innerHTML = '';
    
    if (workoutExercises.length === 0) {
        exercisesList.innerHTML = '<p>No exercises added yet. Click "Add Exercise" to add some.</p>';
        return;
    }
    
    workoutExercises.forEach((exercise, index) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        exerciseDiv.style.border = '1px solid #ddd';
        exerciseDiv.style.padding = '15px';
        exerciseDiv.style.borderRadius = '4px';
        exerciseDiv.style.marginTop = '10px';

        exerciseDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>${exercise.name}</h4>
                <div>
                    <button type="button" class="btn btn-secondary edit-exercise" data-index="${index}">Edit</button>
                    <button type="button" class="btn btn-danger remove-exercise" data-index="${index}">Remove</button>
                </div>
            </div>
            <p><strong>Sets:</strong> ${exercise.sets}</p>
            <p><strong>Reps:</strong> ${exercise.reps.join(', ')}</p>
        `;
        
        exercisesList.appendChild(exerciseDiv);
    });

    const editButtons = document.querySelectorAll('.edit-exercise');
    const removeButtons = document.querySelectorAll('.remove-exercise');
    
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            openExerciseModalForEdit(index);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (confirm('Are you sure you want to remove this exercise from the workout?')) {
                workoutExercises.splice(index, 1);
                renderExercisesList();
            }
        });
    });
}

function openExerciseModalForEdit(index) {
    const exercise = workoutExercises[index];
    editingExerciseIndex = index;

    exerciseSelect.value = exercise.id;
    exerciseSets.value = exercise.sets;

    generateRepInputs(exercise.sets, exercise.reps);

    addExerciseToWorkoutBtn.textContent = 'Update Exercise';

    exerciseModal.style.display = 'flex';
}

// Add exercise to workout
function addExerciseToWorkout() {
    const exerciseId = parseInt(exerciseSelect.value);
    const sets = parseInt(exerciseSets.value);

    const reps = [];
    for (let i = 1; i <= sets; i++) {
        const repInput = document.getElementById(`reps${i}`);
        reps.push(parseInt(repInput.value));
    }

    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (exercise) {
        if (editingExerciseIndex >= 0) {
            workoutExercises[editingExerciseIndex] = {
                id: exerciseId,
                name: exercise.name,
                sets,
                reps
            };
            editingExerciseIndex = -1;
        } else {
            workoutExercises.push({
                id: exerciseId,
                name: exercise.name,
                sets,
                reps
            });
        }
        
        renderExercisesList();

        addExerciseToWorkoutBtn.textContent = 'Add to Workout';
        exerciseModal.style.display = 'none';
    }
}

// Validate the form before submission
function validateForm() {
    let isValid = true;

    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    
    if (!workoutName.value.trim()) {
        document.getElementById('workoutNameError').textContent = 'Workout name is required';
        isValid = false;
    }

    if (!startDateTime.value) {
        document.getElementById('startDateTimeError').textContent = 'Start date and time is required';
        isValid = false;
    }

    if (!endDateTime.value) {
        document.getElementById('endDateTimeError').textContent = 'End date and time is required';
        isValid = false;
    } else if (new Date(endDateTime.value) <= new Date(startDateTime.value)) {
        document.getElementById('endDateTimeError').textContent = 'End time must be after start time';
        isValid = false;
    }

    if (workoutExercises.length === 0) {
        alert('Please add at least one exercise to the workout');
        isValid = false;
    }
    
    return isValid;
}

// Save the workout
function saveWorkout(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    let workouts = [];
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
        workouts = JSON.parse(savedWorkouts);
    }
    
    const workoutIndex = workouts.findIndex(w => w.id === workoutId);
    
    if (workoutIndex === -1) {
        alert('Workout not found');
        return;
    }

    workouts[workoutIndex] = {
        id: workoutId,
        name: workoutName.value.trim(),
        startDateTime: startDateTime.value,
        endDateTime: endDateTime.value,
        exercises: workoutExercises.map(exercise => ({
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps
        }))
    };

    localStorage.setItem('workouts', JSON.stringify(workouts));

    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {

    loadExercises();
    
    loadWorkout();
    
    addExerciseBtn.addEventListener('click', () => {
        editingExerciseIndex = -1;
        exerciseSets.value = 3;
        generateRepInputs(3);
        addExerciseToWorkoutBtn.textContent = 'Add to Workout';
        exerciseModal.style.display = 'flex';
    });
    
    closeExerciseModal.addEventListener('click', () => {
        exerciseModal.style.display = 'none';
    });
    
    exerciseSets.addEventListener('change', () => {
        const currentReps = [];
        for (let i = 1; i <= parseInt(exerciseSets.value); i++) {
            const repInput = document.getElementById(`reps${i}`);
            if (repInput) {
                currentReps.push(parseInt(repInput.value));
            }
        }
        generateRepInputs(parseInt(exerciseSets.value), currentReps);
    });
    
    cancelExerciseBtn.addEventListener('click', () => {
        exerciseModal.style.display = 'none';
    });
    
    addExerciseToWorkoutBtn.addEventListener('click', addExerciseToWorkout);
    
    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            window.location.href = 'index.html';
        }
    });
    
    workoutForm.addEventListener('submit', saveWorkout);
});