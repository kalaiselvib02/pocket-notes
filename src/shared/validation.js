export function checkEmpty(val){
    return val.trim().length === 0;
}
export function checkLength(val , n){
        return val.trim().length >= n;
}