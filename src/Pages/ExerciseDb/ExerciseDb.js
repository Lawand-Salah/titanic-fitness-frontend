import "./ExerciseDb.css";
import { useEffect, useState } from "react";
import axios from "axios";
import CategoryFilter from "../../Components/CategoryFilter/CategoryFilter";

export default function ExerciseDb() {
    const [filters, setFilter] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [exercisesCache, setExercisesCache] = useState({});

    const [exercise, setExercises] = useState([]);

    function getExercises() {
        setIsLoading(true);
        setError("");

        let api_endpoint =
            "https://wger.de/api/v2/exerciseinfo/?language=2&limit=900";

        if (filters > 0) {
            api_endpoint += `&category=${filters}`;
        }

        let cached = null;

        try {
            cached = localStorage.getItem(api_endpoint);
        } catch (storageError) {
            console.log("Could not read exercise cache:", storageError);
        }

        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);

                if (Array.isArray(parsedCache)) {
                    setExercises(parsedCache);
                    setIsLoading(false);
                    return;
                }

                console.log("Exercise cache is not an array.");
            } catch (parseError) {
                console.log("Invalid exercise cache:", parseError);
            }
        }

        axios.get(api_endpoint)
            .then((response) => {
                console.log(response.data.results);

                let foundExercises = [];

                for (let exerciseMetadata of response.data.results) {
                    const englishTranslation =
                        exerciseMetadata.translations.find(
                            (translation) => translation.language === 2
                        );

                    if (englishTranslation) {
                        foundExercises.push({
                            id: exerciseMetadata.id,
                            name: englishTranslation.name,
                            category: exerciseMetadata.category
                        });
                    }
                }

                try {
                    localStorage.setItem(
                        api_endpoint,
                        JSON.stringify(foundExercises)
                    );
                } catch (storageError) {
                    console.log(
                        "Could not save exercise cache:",
                        storageError
                    );
                }

                setExercises(foundExercises);
                setIsLoading(false);

                console.log(foundExercises);
            })
            .catch((error) => {
                console.log(error);
                setError("Couldn't load exercises. Please try again.");
                setIsLoading(false);
            });
    }

    useEffect(() => {
        getExercises();
    }, [filters]);

    return (
        <div className="exercise-db-container">
            <CategoryFilter
                selected={filters}
                setFilter={setFilter}
            />

            {isLoading && (
                <div className="exercise-db-state">
                    Loading exercises...
                </div>
            )}

            {!isLoading && error && (
                <div className="exercise-db-state exercise-db-error">
                    {error}
                </div>
            )}

            {!isLoading && !error && exercise.length === 0 && (
                <div className="exercise-db-state">
                    No exercises found for this category.
                </div>
            )}

            {!isLoading && !error && exercise.length > 0 && (
                <>
                    <div className="exercise-db-count">
                        Showing {exercise.length} exercise
                        {exercise.length !== 1 ? "s" : ""}
                    </div>

                    <div className="exercise-db-grid">
                        {exercise.map((exerciseItem) => (
                            <div
                                className="exercise-db-card"
                                key={exerciseItem.id}
                            >
                                <div className="exercise-db-name">
                                    {exerciseItem.name}
                                </div>

                                <div className="exercise-db-category">
                                    {exerciseItem.category?.name ||
                                        "Uncategorised"}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}