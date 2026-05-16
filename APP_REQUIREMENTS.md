**Assessment** [**respond.io**](http://respond.io)

Objective

You will create a Flow Chart app with the necessary functionality to create, edit and delete nodes. The purpose of this assignment is to assess your skills with Vue 3 and your level of understanding of the requirements.

Technology

You are required to use the following technologies:

*   Programming Language: JavaScript/ES6
    
*   Framework/Libraries: Vite, Vue 3, Pinia, Vue Router, Vue Flow, Query, Tailwind CSS
    
*   (Note: Feel free to utilize any Ul frameworks or components)
    

Features

You are required to develop the following features in your Application

Flow Chart: Canvas

*   Utilized vue-flow library to display nodes accordingly from this JSON payload.json
    
*   Add draggable functionality for each node, so users can move nodes across the canvas.
    

Create Node

*   Add a Create New Node button on the page for creating nodes with the following Fields:
    
    *   Title - text field
        
    *   Description - text field
        
    *   Type of Node - select field
        
        *   Send Message (sendMessage)
            
        *   Add Comments (addComment)
            
        *   Business Hours (businessHours)
            

Node View in Canvas

*   Each node on the canvas should contain the following information.
    
    *   Icons
        
    *   Title
        
    *   Description (truncated)
        

Node Details: Drawer

*   Each node should have its own Details drawer to display its properties and attachments.
    
    *   The Details drawer should be accessible via URL containing the node ID.
        
    *   The Details drawer should be able to be toggled by clicking on the node.
        
    *   The Title and Description Fields should be Editable.
        
    *   Provide an option for the user to Delete the node.
        
*   Send Message
    
    *   Display existing attachments as Tile/Box Preview, and also allow the user to upload new attachments.
        
    *   Display existing texts in an input text field, and allow user to update/remove texts
        
*   Add Comments
    
    *   Display existing comment in an input text field, and allow user to update/remove comment
        
*   Business Hours
    
    *   Display existing business hours
        
    *   Utilized a Date Time Picker to update business hours
        
    *   (Note that success & failure node should not be accessible, purely for display in canvas)
        

Query

*   Utilized Query for data fetching and mutation updates involving the JSON payload.
    
*   Use below configuration for the Query:
    

{

queryClientConfig: {

defaultOptions: {

queries: {

refetchOnWindowFocus: false,

networkMode: ‘always’,

staleTime: Infinity,

gcTime: 60 \* 60 \* 1000,

}

}

}

}

Key Details To Keep In Mind

*   The transition between canvas and nodes should be buttery smooth.
    
*   All input fields should have necessary validations.
    
*   Well-written code, optimized renders, and utility functions extracted in a separate file
    
*   Ensure comprehensive unit tests on components and necessary logics.
    
*   Use Pinia and Vue-Router for storing data and routing respectively.
    
*   Custom implementation will be appreciated (i.e. not using source code from any open-source project).
    
*   Provide a clear, well-documented README that explains setup, design decisions, and how to run the project.
    

Nice To Have

*   Undo/Redo for node moves and edits
    
*   Keyboard accessibility for selecting nodes and opening the details drawer
    
*   CI/CD pipeline for running the tests