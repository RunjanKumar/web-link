import { useState } from "react";
import { submitFeedback } from "../api/service/feedbackService";
import { getApiErrorMessage } from "../api/client";
import { toast } from "sonner";
import useCustomerProfile from "../hooks/CustomerProfile";

export default function useFeedbackViewModel() {
    const [star, setStar] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { canOrder, orderLockMessage } = useCustomerProfile();


    // when user clicks star
    function handleRatingChange(value) {
        setStar(value);
    }

    // when user types message
    function handleMessageChange(event) {
        setNotes(event.target.value);
    }

    const handleSubmit = async () => {
        // Feedback is about the stay — meaningless before check-in (and the
        // server rejects it for non-checked-in guests anyway).
        if (!canOrder) {
            toast.info(orderLockMessage);
            return;
        }
        setLoading(true);
        try {
            await submitFeedback({ star, notes });
            toast.success('Thank you for your feedback!');
            // Reset form after successful submission
            setStar(0);
            setNotes('');
        } catch (error) {
            const message = getApiErrorMessage(error, 'Failed to submit feedback.');
            toast.error(message);
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