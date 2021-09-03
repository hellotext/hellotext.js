### HelloText JavaScript client

### Installation 

- Using NPM
```bash
npm install hellotext
```

- Using yarn
```bash
yarn add hellotext
```

### Usage

- import the class
```javascript
import HelloText from "hellotext"
```
- call `initialize` to set up the class
```javascript
HelloText.initialize();
```

### Available APIs

- `trackConversion`: used to track conversion upon a successful operation
```javascript
HelloText.trackConversion({
    clickId,
    title,
    amount,
    metadata // an object containing any information you might need,
})
```


