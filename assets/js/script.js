
// Function to generate a unique task id using a tool called `crypto`
function generateTaskId() {    
    let taskID = crypto.randomUUID();  // `crypto` is a built -in module that we can use in the browser and Nodejs.
    return taskID;
}

// Function to handle adding a new task to local storage and displaying tasks data
function handleAddTask(event) {
    event.preventDefault();
    
    // Read user input from the modal and store it into 'newTask' object 
    const taskTitle = $('#task-title').val().trim(); // trim extra spaces
    const taskDueDate = $('#task-due-date').val();
    const taskDescription = $('#task-description').val().trim(); // trim extra spaces
    
    if (taskTitle == "" || taskDueDate == "") {
        $('#error').text('Enter title and due date to create a task').css( 'color', 'red' );
        
    } else {
        const newTask = {
        id: generateTaskId(),
        title: taskTitle,
        dueDate: dayjs(taskDueDate).format('MMM D, YYYY'), // use Day.js to format the date
        description: taskDescription,
        status: 'to-do'
        };
        
        // Retrieve tasks from the localStorage, parse the JSON to an array and push the new task to the array  
        const tasks = getTasksFromStorage();
        tasks.push(newTask);

        // Save the array with newly added task to the local storage
        saveTasksToStorage(tasks);

        // Display all tasks from the local storage on the screen
        displayTasks();

        // Clear the modal inputs
        $('#task-title').val('');
        $('#task-due-date').val('');
        $('#task-description').val('');   

        // Close the modal after adding a task
        $('#taskModal').modal('hide');
    }     
}

// Retrieve tasks from the localStorage, store in an array and returns array of project objects
function getTasksFromStorage() {    
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    
    // If there are no tasks in localStorage, initialize an empty array ([]) and return it
    if (!tasks) {
        tasks = [];
        console.log('No tasks found in local storage');  
    }   
    return tasks;
}

// Accept an array of tasks, stringify them, and save into localStorage
function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// A function to create a task card on the board
function createTaskCard(task) { 
    //Create elements for a task card
    const taskCard = $('<div>')
        .addClass('card draggable my-3') // adding class 'draggable' to make an element draggable
        .attr('data-task-id', task.id);
    const cardTitle = $('<div>').addClass('card-header h4').text(task.title);
    const cardBody = $('<div>').addClass('card-body');    
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    
    //Create Delete btn element for a task card
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-task-id', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);

    // Set the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        // If the task is due today, make the card yellow. If it is overdue, make it red.
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    // Append the elements created above
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardTitle, cardBody);
    
    return taskCard;
}

// A function to display task cards on the board
function displayTasks() {    
    // Remove all child nodes and content from the selected elements
    const todoTasks = $('#todo-cards');
    todoTasks.empty();

    const inprogressTasks = $('#in-progress-cards');
    inprogressTasks.empty();

    const doneTasks = $('#done-cards');
    doneTasks.empty();
    
    // Retrieve tasks from the localStorage, iterate through tasks and create a task card by calling createTaskCard(task) function
    const tasksList = getTasksFromStorage();    

    if (tasksList){
        for (let task of tasksList) {
            if (task.status === 'to-do') {
                createTaskCard(task).appendTo(todoTasks);
            } else if (task.status === 'in-progress') {
                createTaskCard(task).appendTo(inprogressTasks);                                
            } else {
                // 'done' status
                createTaskCard(task).appendTo(doneTasks);                
            }
        }        
    }

    renderTaskList();    
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {    
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    const taskId = $(this).attr('data-task-id');    
    if (tasks) {
        // Remove a task by id from the array and save updated array by calling saveTasksToStorage(tasks)
        for (let task of tasks) {            
            if (task.id === taskId) {
                tasks.splice(tasks.indexOf(task), 1);                
                saveTasksToStorage(tasks);
            }
        }
    }
    displayTasks();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {    
    const tasks = getTasksFromStorage();

    // Get the task id for the draggable item
    const taskId = ui.draggable[0].dataset.taskId;

    // Get the id of the lane that the card was dropped into
    const newStatus = event.target.id;
    console.log(newStatus);

    // Find the project card by the `id` and update the project status.
    for (let task of tasks) {        
        if (task.id === taskId) {
            task.status = newStatus;
        }
    }

    // Save the updated tasks array to localStorage (overwritting the previous one) and render the new project data to the screen
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();    
}

// Function to render the task list and make cards draggable
function renderTaskList() {
   
    $('.draggable').draggable({
        zIndex: 1, 
        opacity: 0.35,
        containment: $('.swim-lanes'),
        cursor: 'grab'
    });    
}

// When the index.html page loads:
$(document).ready(function () {
    // Display tasks cards on the board (loaded from the localStorage)
    displayTasks();

    // Call handleAddTask() when the modal input is submitted
    $('#add-task').on('click', handleAddTask);        

    // Make lanes droppable
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop
    });   
});
