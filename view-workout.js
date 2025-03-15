// DOM Elements
const workoutName = document.getElementById('workoutName');
const workoutStart = document.getElementById('workoutStart');
const workoutEnd = document.getElementById('workoutEnd');
const workoutDuration = document.getElementById('workoutDuration');
const exercisesList = document.getElementById('exercisesList');
const backButton = document.getElementById('backButton');
const editWorkoutBtn = document.getElementById('editWorkoutBtn');
const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');

// Template Modal Elements
const templateModal = document.getElementById('templateModal');
const closeTemplateModal = document.getElementById('closeTemplateModal');
const templateName = document.getElementById('templateName');
const templateNameError = document.getElementById('templateNameError');
const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');

// Get workout ID from URL
const urlParams = new URLSearchParams(window.location.search);
const workoutId = parseInt(urlParams.get('id'));

// Current workout data
let currentWorkout = null;
let exercises = [];

// Format date for display
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

// Calculate duration between two dates
function calculateDuration(startDateTime, endDateTime) {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

// Load exercises data
function loadExercises() {
    const savedExercises = localStorage.getItem('exercises');
    if (savedExercises) {
        exercises = JSON.parse(savedExercises);
    } else {
        console.log('No exercises found in localStorage');
    }
}

// Load workout data
function loadWorkout() {
    if (!workoutId) {
        window.location.href = 'index.html';
        return;
    }
    
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
        const workouts = JSON.parse(savedWorkouts);
        currentWorkout = workouts.find(w => w.id === workoutId);
        
        if (currentWorkout) {
            displayWorkout();
        } else {
            alert('Workout not found!');
            window.location.href = 'index.html';
        }
    } else {
        alert('No workouts found!');
        window.location.href = 'index.html';
    }
}

// Display workout details
function displayWorkout() {
    workoutName.textContent = currentWorkout.name;
    workoutStart.textContent = formatDateTime(currentWorkout.startDateTime);
    workoutEnd.textContent = formatDateTime(currentWorkout.endDateTime);
    workoutDuration.textContent = calculateDuration(
        currentWorkout.startDateTime, 
        currentWorkout.endDateTime
    );
    
    displayExercises();
}

// Display exercises in the workout
function displayExercises() {
    exercisesList.innerHTML = '';
    
    if (currentWorkout.exercises.length === 0) {
        exercisesList.innerHTML = '<p>No exercises in this workout.</p>';
        return;
    }
    
    currentWorkout.exercises.forEach(workoutExercise => {
        const exercise = exercises.find(e => e.id === workoutExercise.exerciseId);
        
        if (!exercise) {
            console.log(`Exercise with ID ${workoutExercise.exerciseId} not found`);
            return;
        }
        
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        exerciseDiv.style.border = '1px solid #ddd';
        exerciseDiv.style.padding = '15px';
        exerciseDiv.style.borderRadius = '4px';
        exerciseDiv.style.marginTop = '10px';
        
        // Display exercise info
        let setsInfo = '';
        for (let i = 0; i < workoutExercise.sets; i++) {
            const repCount = workoutExercise.reps[i] || 'N/A';
            setsInfo += `<div><strong>Set ${i+1}:</strong> ${repCount} reps</div>`;
        }
        
        exerciseDiv.innerHTML = `
            <h4>${exercise.name}</h4>
            <p><strong>Type:</strong> ${exercise.type}</p>
            <p><strong>Description:</strong> ${exercise.description}</p>
            <div class="sets-info">
                <p><strong>Sets:</strong> ${workoutExercise.sets}</p>
                ${setsInfo}
            </div>
        `;
        
        exercisesList.appendChild(exerciseDiv);
    });
}

// Save current workout as template
function saveAsTemplate() {
    // Validate template name
    if (!templateName.value.trim()) {
        templateNameError.textContent = 'Template name is required';
        return;
    }
    
    // Get existing templates
    let templates = [];
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
        templates = JSON.parse(savedTemplates);
    }
    
    // Create new template object
    const newTemplate = {
        id: Math.max(...templates.map(t => t.id), 0) + 1,
        name: templateName.value.trim(),
        exercises: currentWorkout.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps[0] // Use the first rep count as the template rep count
        }))
    };
    
    // Add to templates array
    templates.push(newTemplate);
    
    // Save to localStorage
    localStorage.setItem('templates', JSON.stringify(templates));
    
    // Close modal and show confirmation
    templateModal.style.display = 'none';
    alert('Template saved successfully!');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadExercises();
    loadWorkout();
    
    // Navigate back to workouts list
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Go to edit page
    editWorkoutBtn.addEventListener('click', () => {
        window.location.href = `edit-workout.html?id=${workoutId}`;
    });
    
    // Open save as template modal
    saveAsTemplateBtn.addEventListener('click', () => {
        templateName.value = `${currentWorkout.name} Template`;
        templateNameError.textContent = '';
        templateModal.style.display = 'flex';
    });
    
    // Template modal events
    closeTemplateModal.addEventListener('click', () => {
        templateModal.style.display = 'none';
    });
    
    cancelTemplateBtn.addEventListener('click', () => {
        templateModal.style.display = 'none';
    });
    
    saveTemplateBtn.addEventListener('click', saveAsTemplate);
});