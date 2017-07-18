# Check Digit Algorithms

This page defines the basic check digit algorithms used by couriers to
verify that a tracking number is valid.

This reference page is useful for anyone wishing to use this repository
to create a new tracking number library in your language.  Keep in mind
that the implementation in your language may already exist!



    def mod7(arr: List[int], checkDigit: int):
        x: Long = parseLong(string(arr))
        return x % 7 == checkDigit;

    def mod10(
            arr: List[int], checkDigit: int,
            evensMultiplier: int, oddsMultiplier: int):
        total = sum(
            idx % 2 == 0 and evensMultiplier * val or oddsMultiplier * val
            for idx, val in enumerate(arr))
        x = total % 10;
        if (x != 0) {
            x = 10 - x;
        }
        return x == checkDigit;

    def s10(seq1: List[int], checkDigit: int):
        int[] weightings = {8,6,4,2,3,5,9,7};
        x = sum(x * y for x, y in zip(seq1, weightings))
        r = x % 11;
        if (r == 1) {
            r = 0;
        } else if (r == 0) {
            r = 5;
        } else {
            r = 11 - r;
        }
        return r == checkDigit;

    def sumProductWithWeightingsAndModulo(
            arr: List[int], checkDigit: int, weightings: List[int],
            modulo1: int, modulo2: int):
        x = sum(x * y for x, y in zip(seq1, weightings))
        return x % modulo1 % modulo2 == checkDigit;

    def dummy(arr: List[int], checkDigit: int):
        return True
