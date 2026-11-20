import "./AddWorkout.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";

export default function AddWorkout() {

    const { user } = useContext(UserContext);

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

    const [workoutDay, setWorkoutDay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {

        // Handle a missing logged-in user.
        if (!user || !user.email) {
            setLoading(false);
            setError(false);
            setWorkoutDay(null);
            return;
        }

        // Handle an empty date.
        if (!selectedDate) {
            setLoading(false);
            setError(false);
            setWorkoutDay(null);
            return;
        }

        let ignore = false;

        async function fetchWorkoutDay() {

            setLoading(true);
            setError(false);
            setWorkoutDay(null);

            try {

                const response = await axios.post(
                    "http://localhost:8001/workouts/workout_day",
                    {
                        user_email: user.email,
                        date: selectedDate
                    },
                    {
                        timeout: 5000
                    }
                );

                if (!ignore) {
                    setWorkoutDay(response.data);
                }

            } catch (requestError) {

                console.error(
                    "Failed to fetch workout day:",
                    requestError
                );

                if (!ignore) {
                    setError(true);
                    setWorkoutDay(null);
                }

            } finally {

                if (!ignore) {
                    setLoading(false);
                }

            }

        }

        fetchWorkoutDay();

        return () => {
            ignore = true;
        };

    }, [user, selectedDate, refreshKey]);

    const hasExercises =
        workoutDay &&
        workoutDay.exercises &&
        Object.keys(workoutDay.exercises).length > 0;

    async function handleSubmit(event) {

        event.preventDefault();

        setSaveMessage("");

        if (!exerciseName.trim()) {
            setSaveMessage("Exercise name is required.");
            return;
        }

        if (!reps.trim()) {
            setSaveMessage("Reps must be a whole number of at least 1.");
            return;
        }

        if (!weight.trim()) {
            setSaveMessage("Weight must be 0 or more.");
            return;
        }

        const repsNumber = Number(reps);
        const weightNumber = Number(weight);

        if (!Number.isInteger(repsNumber) || repsNumber < 1) {
            setSaveMessage("Reps must be a whole number of at least 1.");
            return;
        }

        if (!Number.isFinite(weightNumber) || weightNumber < 0) {
            setSaveMessage("Weight must be 0 or more.");
            return;
        }

        if (!user || !user.email || !selectedDate) {
            setSaveMessage("Couldn't save this set. Please try again.");
            return;
        }

        setSaving(true);

        try {

            await axios.post(
                "http://localhost:8001/workouts/add_exercise",
                {
                    user_email: user.email,
                    date: selectedDate,
                    exercise_name: exerciseName.trim(),
                    reps: repsNumber,
                    weight: weightNumber
                },
                {
                    timeout: 5000
                }
            );

            setExerciseName("");
            setReps("");
            setWeight("");

            // Tell the existing useEffect to fetch the
            // selected day's workout again.
            setRefreshKey((currentKey) => currentKey + 1);

        } catch (requestError) {

            console.error(
                "Failed to save workout:",
                requestError
            );

            setSaveMessage(
                "Couldn't save this set. Please check the server and try again."
            );

        } finally {

            setSaving(false);

        }
    }

    return (
        <div className="workout-tracker-wrapper">

            <div className="workout-summary-container">

                <h2>Workout Summary</h2>

                {!user || !user.email ? (
                    <p>Please log in</p>
                ) : !selectedDate ? (
                    <p>Select a date</p>
                ) : loading ? (
                    <p>Loading workout...</p>
                ) : error ? (
                    <p>
                        Couldn't load this workout. Please check the
                        server and try again.
                    </p>
                ) : !hasExercises ? (
                    <p>No exercises logged for this day</p>
                ) : (
                    <div className="workout-exercises">

                        {Object.entries(workoutDay.exercises).map(
                            ([exercise, sets]) => (
                                <div
                                    className="workout-exercise"
                                    key={exercise}
                                >

                                    <h3>{exercise}</h3>

                                    <ul
                                        style={{
                                            listStyle: "none",
                                            padding: 0,
                                            margin: 0
                                        }}
                                    >
                                        {sets.map((set, index) => (
                                            <li
                                                key={`${exercise}-${index}`}
                                            >
                                                Set {index + 1}: {set.reps} reps × {set.weight} kg
                                            </li>
                                        ))}
                                    </ul>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

            <form className="workout-form" onSubmit={handleSubmit}>

                <h2>New Set</h2>

                <label htmlFor="workout-date">
                    Date
                </label>

                <input
                    id="workout-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setSaveMessage("");
                    }}
                />

                <label htmlFor="exercise-name">
                    Exercise
                </label>

                <input
                    id="exercise-name"
                    type="text"
                    value={exerciseName}
                    onChange={(event) => {
                        setExerciseName(event.target.value);
                        setSaveMessage("");
                    }}
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
                    onChange={(event) => {
                        setReps(event.target.value);
                        setSaveMessage("");
                    }}
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
                    onChange={(event) => {
                        setWeight(event.target.value);
                        setSaveMessage("");
                    }}
                    placeholder="e.g. 60"
                />

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Add Set"}
                </button>

                {saveMessage && (
                    <p>{saveMessage}</p>
                )}
            </form>

        </div>
    );
}