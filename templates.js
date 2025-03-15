// Mock data
let templates = [
    {
        id: 1,
        name: "Full Body Workout Template",
        exercises: [
            { exerciseId: 1, sets: 3, reps: 12 },
            { exerciseId: 2, sets: 3, reps: 10 },
            { exerciseId: 4, sets: 3, reps: 8 }
        ]
    },
    {
        id: 2,
        name: "Upper Body Template",
        exercises: [
            { exerciseId: 1, sets: 4, reps: 8 },
            { exerciseId: 4, sets: 3, reps: 10 }
        ]
    },
    {
        id: 3,
        name: "Lower Body Template",
        exercises: [
            { exerciseId: 2, sets: 4, reps: 12 },
            { exerciseId: 3, sets: 1, reps: 20 }
        ]
    }
]; 

const templatesTable = document.getElementById('templatesTable');
const addTemplateBtn = document.getElementById('addTemplateBtn');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

let templateToDelete = null;

// Populate templates table
function renderTemplates() {
    const tbody = templatesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    templates.forEach(template => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${template.name}</td>
            <td>${template.exercises.length}</td>
            <td class="actions">
                <button class="btn" data-id="${template.id}" data-action="use">Use Template</button>
                <button class="btn btn-secondary" data-id="${template.id}" data-action="edit">Edit</button>
                <button class="btn btn-danger" data-id="${template.id}" data-action="delete">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const actionButtons = tbody.querySelectorAll('button[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleTemplateAction);
    });
}
function handleTemplateAction(e) {
    const action = e.target.getAttribute('data-action');
    const templateId = parseInt(e.target.getAttribute('data-id'));
    
    switch(action) {
        case 'use':
            window.location.href = `add-workout.html?templateId=${templateId}`;
            break;
        case 'edit':
            window.location.href = `edit-template.html?id=${templateId}`;
            break;
        case 'delete':
            templateToDelete = templateId;
            deleteModal.style.display = 'flex';
            break;
    }
}

addTemplateBtn.addEventListener('click', () => {
    window.location.href = 'add-template.html';
});

closeDeleteModal.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    templateToDelete = null;
});

cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    templateToDelete = null;
});

confirmDelete.addEventListener('click', () => {
    if (templateToDelete !== null) {
        templates = templates.filter(template => template.id !== templateToDelete);
        localStorage.setItem('templates', JSON.stringify(templates));
        renderTemplates();
        deleteModal.style.display = 'none';
        templateToDelete = null;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
        templates = JSON.parse(savedTemplates);
    } else {
        localStorage.setItem('templates', JSON.stringify(templates));
    }
    
    renderTemplates();
});