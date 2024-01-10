var assert = require('assert');
describe('SELECT', function () {
    it('SELECT with column letters', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = SELECT(table, "*B, *A")
        assert.deepEqual(output, [['age', 'name'], [2, 'Alice'], [4, 'Bob'], [10, 'Alice']])
    });

    it('SELECT with header name', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = SELECT(table, "*B, *name")
        assert.deepEqual(output, [['age', 'name'], [2, 'Alice'], [4, 'Bob'], [10, 'Alice']])
    });

    it('SELECT with renaming', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = SELECT(table, "*B AS StudentAge, *name AS 'My Name'")
        assert.deepEqual(output, [['StudentAge', 'My Name'], [2, 'Alice'], [4, 'Bob'], [10, 'Alice']])
    });
    
    it('SELECT with repeated columns', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = SELECT(table, "*B AS StudentAge, *name AS 'My Name', *name")
        assert.deepEqual(output, [['StudentAge', 'My Name', 'name'], [2, 'Alice', 'Alice'], [4, 'Bob', 'Bob'], [10, 'Alice', 'Alice']])
    });
});

// describe('SELECT', function () {
//     it('SELECT with column letters', function () {
//         const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
//         const output = SELECT(table, "*B, *A")
//         assert.deepEqual(output, [['age', 'name'], [2, 'Alice'], [4, 'Bob'], [10, 'Alice']])
//     });