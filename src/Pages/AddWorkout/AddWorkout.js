import "./AddWorkout.css";
import { useState } from "react";

export default function AddWorkout() {

    // Get today's date in the user's local timezone.
    // We avoid toISOString() because that uses UTC.
    const today = new Date();
    const localDate =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    const [selectedDate, setSelectedDate] = useState(localDate);
    const [exerciseName, setExerciseName] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");

    return (
        <div className="workout-tracker-wrapper">
            <div className="workout-summary-container">
                <h2>Workout Summary</h2>
                <p>Workout data will appear here in the next step.</p>
            </div>
            <form className="workout-form">
                <h2>New Set</h2>
                <label htmlFor="workout-date">
                    Date
                </label>
                <input
                    id="workout-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                />
                <label htmlFor="exercise-name">
                    Exercise
                </label>
                <input
                    id="exercise-name"
                    type="text"
                    value={exerciseName}
                    onChange={(event) => setExerciseName(event.target.value)}
                    placeholder="e.g. Bench Press"
                />
                <label htmlFor="reps">
                    Reps
                </label>
                <input
                    id="reps"
                    type="number"
                    min="1"
                    step="1"
                    value={reps}
                    onChange={(event) => setReps(event.target.value)}
                    placeholder="e.g. 10"
                />
                <label htmlFor="weight">
                    Weight (kg)
                </label>
                <input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    placeholder="e.g. 60"
                />
                <button type="submit">
                    Add Set
                </button>
            </form>
        </div>
    );
}