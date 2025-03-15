// DOM elements
const workoutForm = document.getElementById('workoutForm');
const workoutName = document.getElementById('workoutName');
const startDateTime = document.getElementById('startDateTime');
const endDateTime = document.getElementById('endDateTime');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const exercisesList = document.getElementById('exercisesList');
const cancelBtn = document.getElementById('cancelBtn');
const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');

// Exercise modal elements
const exerciseModal = document.getElementById('exerciseModal');
const closeExerciseModal = document.getElementById('closeExerciseModal');
const exerciseSelect = document.getElementById('exerciseSelect');
const exerciseSets = document.getElementById('exerciseSets');
const repsContainer = document.getElementById('repsContainer');
const cancelExerciseBtn = document.getElementById('cancelExerciseBtn');
const addExerciseToWorkoutBtn = document.getElementById('addExerciseToWorkoutBtn');

// Store the current workout data
let workoutId = null;
let workoutExercises = [];
let exercises = [];
let editingExerciseIndex = -1;

// Get workout ID from URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

// Load exercises
function loadExercises() {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
        exercises = JSON.parse(savedExercises);
        
        // Populate exercise select dropdown
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
            startDateTime.value = workout.startDateTime.slice(0, 16); // Format for datetime-local input
            endDateTime.value = workout.endDateTime.slice(0, 16); // Format for datetime-local input
            
            // Load workout exercises
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

// Generate rep input fields based on sets
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
        
        // Display exercise info
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
    
    // Add event listeners to edit and remove buttons
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

// Open the exercise modal for editing
function openExerciseModalForEdit(index) {
    const exercise = workoutExercises[index];
    editingExerciseIndex = index;
    
    // Set values in the modal
    exerciseSelect.value = exercise.id;
    exerciseSets.value = exercise.sets;
    
    // Generate rep inputs
    generateRepInputs(exercise.sets, exercise.reps);
    
    // Change button text
    addExerciseToWorkoutBtn.textContent = 'Update Exercise';
    
    // Show modal
    exerciseModal.style.display = 'flex';
}

// Add exercise to workout
function addExerciseToWorkout() {
    const exerciseId = parseInt(exerciseSelect.value);
    const sets = parseInt(exerciseSets.value);
    
    // Get reps for each set
    const reps = [];
    for (let i = 1; i <= sets; i++) {
        const repInput = document.getElementById(`reps${i}`);
        reps.push(parseInt(repInput.value));
    }
    
    // Find the selected exercise
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (exercise) {
        if (editingExerciseIndex >= 0) {
            // Update existing exercise
            workoutExercises[editingExerciseIndex] = {
                id: exerciseId,
                name: exercise.name,
                sets,
                reps
            };
            editingExerciseIndex = -1;
        } else {
            // Add new exercise
            workoutExercises.push({
                id: exerciseId,
                name: exercise.name,
                sets,
                reps
            });
        }
        
        // Re-render the list
        renderExercisesList();
        
        // Reset and close modal
        addExerciseToWorkoutBtn.textContent = 'Add to Workout';
        exerciseModal.style.display = 'none';
    }
}

// Validate the form before submission
function validateForm() {
    let isValid = true;
    
    // Reset error messages
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    
    // Validate workout name
    if (!workoutName.value.trim()) {
        document.getElementById('workoutNameError').textContent = 'Workout name is required';
        isValid = false;
    }
    
    // Validate start date and time
    if (!startDateTime.value) {
        document.getElementById('startDateTimeError').textContent = 'Start date and time is required';
        isValid = false;
    }
    
    // Validate end date and time
    if (!endDateTime.value) {
        document.getElementById('endDateTimeError').textContent = 'End date and time is required';
        isValid = false;
    } else if (new Date(endDateTime.value) <= new Date(startDateTime.value)) {
        document.getElementById('endDateTimeError').textContent = 'End time must be after start time';
        isValid = false;
    }
    
    // Validate that there's at least one exercise
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
    
    // Get existing workouts
    let workouts = [];
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
        workouts = JSON.parse(savedWorkouts);
    }
    
    // Find the workout by ID
    const workoutIndex = workouts.findIndex(w => w.id === workoutId);
    
    if (workoutIndex === -1) {
        alert('Workout not found');
        return;
    }
    
    // Update the workout object
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
    
    // Save to localStorage
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    // Redirect to workouts page
    window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load exercises
    loadExercises();
    
    // Load workout data
    loadWorkout();
    
    // Add event listeners
    addExerciseBtn.addEventListener('click', () => {
        // Reset modal
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