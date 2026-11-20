import "./AddWorkout.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";

export default function AddWorkout(){

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

    useEffect(() => {

        if (!user || !user.email || !selectedDate) {
            return;
        }

        let ignore = false;

        async function fetchWorkoutDay(){

            setLoading(true);
            setError(false);
            setWorkoutDay(null);

            try {

                const response = await axios.post(
                    "http://localhost:8001/workouts/workout_day",
                    {
                        user_email: user.email,
                        date: selectedDate
                    }
                );

                if (!ignore) {
                    setWorkoutDay(response.data);
                }

            } catch (error) {

                console.error("Failed to fetch workout day:", error);

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

    }, [user, selectedDate]);

    const hasExercises =
        workoutDay &&
        workoutDay.exercises &&
        Object.keys(workoutDay.exercises).length > 0;

    return(
        <div className="workout-tracker-wrapper">

            <div className="workout-summary-container">

                <h2>Workout Summary</h2>

                {loading && (
                    <p>Loading workout...</p>
                )}

                {!loading && error && (
                    <p>Couldn't load this workout. Please check the server and try again.</p>
                )}

                {!loading && !error && workoutDay && !hasExercises && (
                    <p>No exercises logged for this day</p>
                )}

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