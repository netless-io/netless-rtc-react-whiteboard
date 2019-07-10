export function displayWatch(seconds: number): string {
    const displaySeconds = seconds % 60;
    const minutes = (seconds - displaySeconds) / 60;

    if (minutes >= 60) {
        const displayMinutes = minutes % 60;
        const hours = (minutes - displayMinutes) / 60;

        return `${hours} : ${displayMinutes} : ${displaySeconds}`;

    } else {
        return `${minutes} : ${displaySeconds}`;
    }
}
