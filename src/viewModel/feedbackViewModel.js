import { useState } from "react";
import { submitFeedback } from "../api/service/feedbackService";
import { getApiErrorMessage } from "../api/client";
import { useToast } from "../globalComponents/Toast";

export default function useFeedbackViewModel() {
    const [star, setStar] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // when user clicks star
    function handleRatingChange(value) {
        setStar(value);
    }

    // when user types message
    function handleMessageChange(event) {
        setNotes(event.target.value);
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitFeedback({ star, notes });
            showToast('Thank you for your feedback!', 'success');
            // Reset form after successful submission
            setStar(0);
            setNotes('');
        } catch (error) {
            const message = getApiErrorMessage(error, 'Failed to submit feedback.');
            showToast(message, 'error');
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