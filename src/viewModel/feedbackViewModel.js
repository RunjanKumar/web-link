import { useState } from "react";
import { submitFeedback } from "../api/service/feedbackService";

export default function useFeedbackViewModel() {
    const [star, setStar] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // when user clicks star
    function handleRatingChange(value) {
        console.log("star rating is", value);
        setStar(value);
    }

    // when user types message
    function handleMessageChange(event) {
        console.log("message is", event.target.value);
        setNotes(event.target.value);
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitFeedback({ star, notes });
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        star,
        notes,
        loading,
        handleRatingChange,
        handleMessageChange,
        handleSubmit
    };


}