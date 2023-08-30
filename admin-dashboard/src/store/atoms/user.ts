import { atom } from "recoil";

interface UserState {
    isLoading: boolean;
    userEmail: string | null;
}

export const userState = atom<UserState>({
    key: 'userState',
    default: {
        isLoading: true,
        userEmail: null
    }
})