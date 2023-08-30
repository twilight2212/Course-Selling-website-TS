import { atom } from "recoil";

interface CourseState {
    isLoading: boolean;
    course: {
        _id?: String,
        title?: String,
        description?: String,
        price?: Number,
        imageLink?: String,
        published?: Boolean
    } | null
}

export const courseState = atom<CourseState>({
    key: 'courseState',
    default: {
        isLoading: true,
        course: null
    }
})