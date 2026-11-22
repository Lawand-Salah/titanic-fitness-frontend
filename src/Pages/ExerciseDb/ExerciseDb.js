import "./ExerciseDb.css";
import { useEffect, useState } from "react";
import axios from "axios";
import CategoryFilter from "../../Components/CategoryFilter/CategoryFilter";

export default function ExerciseDb() {
    const [filters, setFilter] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [exercise, setExercises] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        let isActive = true;

        async function getExercises() {
            setIsLoading(true);
            setError("");

            const cacheKey = `exercise-db:v2:${filters}`;

            try {
                let cached = null;

                try {
                    cached = localStorage.getItem(cacheKey);
                } catch (storageError) {
                    // Cache failure should not prevent the API request.
                }

                if (cached) {
                    try {
                        const parsedCache = JSON.parse(cached);

                        if (Array.isArray(parsedCache)) {
                            if (!isActive) {
                                return;
                            }

                            setExercises(parsedCache);
                            setIsLoading(false);
                            return;
                        }
                    } catch (parseError) {
                        // Invalid cache should be ignored and replaced by fresh data.
                    }
                }

                let nextUrl =
                    "https://wger.de/api/v2/exerciseinfo/?language=2&limit=900";

                if (filters > 0) {
                    nextUrl += `&category=${filters}`;
                }

                const foundExercises = [];

                while (nextUrl && isActive) {
                    const response = await axios.get(nextUrl, {
                        signal: controller.signal
                    });

                    for (const exerciseMetadata of response.data.results) {
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

                    nextUrl = response.data.next;
                }

                if (!isActive) {
                    return;
                }

                try {
                    localStorage.setItem(
                        cacheKey,
                        JSON.stringify(foundExercises)
                    );
                } catch (storageError) {
                    // Cache failure should not prevent the exercises from displaying.
                }

                setExercises(foundExercises);
                setIsLoading(false);
            } catch (requestError) {
                if (!isActive || controller.signal.aborted) {
                    return;
                }

                setError("Couldn't load exercises. Please try again.");
                setIsLoading(false);
            }
        }

        getExercises();

        return () => {
            isActive = false;
            controller.abort();
        };
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