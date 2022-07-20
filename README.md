# Assignment 2: Write data to a smart contract

## How to run

Run following command to query weather data from URL, and report weather to contract, then read the weather from contract.

```
node report-weather.js
```

Run following command to use `multicall` to batch got weather for a given batchId.

```
node multicall-weather.js
```

The multicall contract is deployed [here](https://testnet.cronoscan.com/address/0x8A4D939d3D64ED8c92831aEbb87999f264e6d1D3#code).

## Answers to additional questions

**Question 1: If the API returns the temperature in a decimal form (like 27.5 C), how to submit this decimal number to the smart contract while keeping its precision.**

Answer: Let's say the temperature's precision is 2 decimals, we can multiple the weather by 100 when we write the weather to contract storage, and divide it by 100 when we read the weather. `uint32` is large enough to save the temperature even after mulitpled by 100, because the number of real temperature usually is not that large.

**Question 2: How to store a negative temperature while keeping the current smart contract interface unchanged?**

Answer: We can mimic the two's complement to store negative value into a `uint32` type.

How to store a number:

-   To store a number `N`, where `0 <= N <= 2^31-1`, we store it as is.
-   To store a negative number `-N`, where `0 <= N <= 2^31`, we store the value as `2^32-N`.

How to read a number:

-   If we read a number `N` from contract, and `0 <= N <= 2^31-1`, we keep it as is.
-   If we read a number `N` from contract, and `2^31 <= N <= 2^32-1`, we calculate `N-2^32` to recover the negative value.
