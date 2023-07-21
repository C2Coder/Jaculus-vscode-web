

class Test {
	constructor() {
		console.log('test');
	}

	public async activate(): Promise<void> {
		console.log('activate');
	}
}

export default Test;

type TestType = {
	foo: string;
}

export { TestType };

let myTest = new Test();