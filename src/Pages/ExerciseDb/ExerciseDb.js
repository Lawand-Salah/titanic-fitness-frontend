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
        let api_endpoint = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=900";

        if (filters > 0) {
            api_endpoint += `&category=${filters}`;
        }

        // if (exercisesCache[api_endpoint]){
        //     setExercises(exercisesCache[api_endpoint]);
        //     setIsLoading(false);
        //     return;
        // }

        let cached = null;

        try {
            cached = localStorage.getItem(api_endpoint);
        } catch (storageError) {
            console.log("Could not read exercise cache:", storageError);
        }

        if (cached) {
            try {
                setExercises(JSON.parse(cached));
                setIsLoading(false);
                return;
            } catch (parseError) {
                console.log("Invalid exercise cache:", parseError);
            }
        }

        axios.get(api_endpoint)
        .then((response) => {
            console.log(response.data.results);

            let foundExercises = [];

            for (let exerciseMetadata of response.data.results) {
                const englishTranslation = exerciseMetadata.translations.find(
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

            // setExercisesCache({
            //     ...exercisesCache,
            //     [api_endpoint]: foundExercises
            // });

            try {
                localStorage.setItem(
                    api_endpoint,
                    JSON.stringify(foundExercises)
                );
            } catch (storageError) {
                console.log("Could not save exercise cache:", storageError);
            }

            setExercises(foundExercises);
            setIsLoading(false);

            console.log(foundExercises);
        })
        .catch((error) => {
            console.log(error);
            setError(error?.response?.data?.detail || "Error Occured");
            setIsLoading(false);
        });
    }

    useEffect(() => {
        console.log("reee");
        getExercises();
    }, [filters]);

    if (isLoading) {
        return (
            <>
                <CategoryFilter selected={filters} setFilter={setFilter} />
                <div>Error loading filters: {error}</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <CategoryFilter selected={filters} setFilter={setFilter} />
                <div>Error loading filters: {error}</div>
            </>
        );
    }

    return (
        <>
            <CategoryFilter selected={filters} setFilter={setFilter} />
            {
                exercise.map((exercise, i) => {
                    return <div key={i}>{exercise.name}</div>
                })
            }
        </>
    );
}