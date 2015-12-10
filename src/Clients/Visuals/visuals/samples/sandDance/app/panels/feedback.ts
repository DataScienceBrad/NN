//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    feedback.js - dialog panel to collect feedback from the user.
//-------------------------------------------------------------------------------------

// module sandDance {
//     export module panels {
//         export var feedback: any = {
//             isDialog: true,
//             rows: [
//                 { prompt: "Provide feedback on SandDance:", leftMargin: 10, tip: "Specify the type of feedback you want to provide", dataName: "feedbackType" },
//                 { radio: "Ideas", leftMargin: 15, tip: "An idea about a new feature or a way to improve an existing feature", value: "Ideas", dataName: "feedbackType", userAction: false },
//                 { radio: "Likes", leftMargin: 15, tip: "A comment about something you like in SandDance", value: "Likes", dataName: "feedbackType", userAction: false },
//                 { radio: "Dislikes", leftMargin: 15, tip: "A comment about something you don't like in SandDance", value: "Dislikes", dataName: "feedbackType", userAction: false },
// 
//                 {
//                     textArea: null, tip: "Your feedback.", dataName: "feedbackText", width: "300px", height: "100px",
//                     placeholder: "Enter your feedback here."
//                 },
// 
//                 { emptyRow: true },
//                 { col: 1, button: "OK", tip: "Submit this feedback and close the panel", textAlign: "right", width: 80, dataName: "submitFeedback", acceptButton: true },
//             ]
//         };
//     }
// }