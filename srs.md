1. Introduction
1.1 Purpose

This document describes the Software Requirements Specification (SRS) for the MediScan Multimedia Health Assistant Prototype, a web-based multimedia system developed for academic demonstration in an Electronic Media and Multimedia Systems course.

The system demonstrates integration of audio input, text processing, simple rule-based logic, and animated visual output within a single interactive interface.

1.2 Scope

MediScan is a multimedia prototype designed to:

Accept user input through text and simulated voice interaction

Process symptom descriptions using simple rule-based logic

Generate educational health explanations

Display animated visual output

Demonstrate hologram-style visualization concepts inspired by historical illusion techniques associated with John Henry Pepper

This system is intended for educational demonstration purposes only and does not provide medical diagnosis.

1.3 Definitions

Multimedia System: A system that integrates multiple forms of media such as text, audio, and visual elements.

Rule-Based Logic: A simple decision system using conditional statements.

Pepper’s Ghost Illusion: A visual display technique using reflection to simulate holographic projection.

2. Overall Description
2.1 Product Perspective

MediScan is a standalone web-based prototype built using:

HTML

CSS

JavaScript

3D visualization library such as Three.js

The system runs locally in a web browser and does not require cloud infrastructure.

2.2 Product Functions

The system shall:

Allow users to enter symptoms through text input.

Simulate voice input interaction.

Process symptom keywords using rule-based logic.

Generate educational explanation output.

Display animated visual representation.

Simulate hologram-style visualization layout.

2.3 User Characteristics

Intended users:

Students

Lecturers

Academic evaluators

Users are expected to have basic familiarity with web interfaces.

2.4 Constraints

The system is a prototype and does not connect to real medical databases.

No external API integration is required.

The system runs in a local browser environment.

Medical explanations are simplified and educational only.

3. Functional Requirements
3.1 Input Module

FR-1: The system shall provide a text input field for symptom description.
FR-2: The system shall provide a button to trigger processing.
FR-3: The system may simulate voice input interaction for demonstration purposes.

3.2 Processing Module

FR-4: The system shall analyze input text using predefined keyword rules.
FR-5: The system shall generate an educational explanation based on detected keywords.
FR-6: If no known keywords are detected, the system shall return a default message.

3.3 Output Module

FR-7: The system shall display generated explanation text.
FR-8: The system shall display animated visual output.
FR-9: The system shall simulate holographic layout presentation.

4. Non-Functional Requirements
4.1 Usability

The interface shall be simple and intuitive.

The system shall be easy to demonstrate during presentation.

4.2 Performance

Response time shall not exceed 2 seconds after user input.

Animations shall run smoothly in modern web browsers.

4.3 Reliability

The system shall handle empty input gracefully.

The system shall not crash under normal usage conditions.

4.4 Portability

The system shall run on modern web browsers (Firefox, Chrome).

The system shall operate on Linux environments such as Arch Linux with Wayland compositors.

5. System Architecture Overview

High-Level Flow:

User Input (Text / Simulated Voice)
            ↓
Rule-Based Processing Module
            ↓
Explanation Generator
            ↓
Animated Visual Output Module
6. Assumptions

Users understand that the system is a prototype.

The system is used for academic demonstration only.

Internet connection is not required for local demonstration.

7. Future Enhancements

Future improvements may include:

Integration with real speech recognition services such as those developed by Google

Real medical knowledge databases

Physical hologram projection hardware

Mobile application deployment

8. Disclaimer

MediScan is an educational multimedia prototype developed for academic purposes. It does not provide professional medical advice, diagnosis, or treatment.

