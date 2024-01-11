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

    it('SELECT with primitive value', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = SELECT(table, "*B AS StudentAge, 1, 'Hello'")
        assert.deepEqual(output, [['StudentAge', 1, 'Hello'], [2, 1, 'Hello'], [4, 1, 'Hello'], [10, 1, 'Hello']])
    });
});

describe.only('WHERE', function () {
    it('WHERE using column letter', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = WHERE(table, "*A='Bob'")
        assert.deepEqual(output, [['name', 'age'], [ 'Bob', 4]])
    });

    it('WHERE using header column mae', function () {
        const table = [['name', 'age'], ['Alice',2], ['Bob',4], ['Alice', 10]]
        const output = WHERE(table, "*age=10")
        assert.deepEqual(output, [['name', 'age'], [ 'Alice', 10]])
    });

    it('WHERE number comparision', function () {
        const table = [['name', 'age'], ['Alice',2], ['Alice', 10], ['Bob',4]]
        const output = WHERE(table, "*age < 10 AND *age >= 1.5")
        assert.deepEqual(output, [['name', 'age'], ['Alice',2], [ 'Bob', 4]])
    });

    it('WHERE string comparision', function () {
        const table = [['name', 'age'], ['Alice',2], ['Alice', 10], ['Bob',4]]
        const output = WHERE(table, "*name > 'Amu'")
        assert.deepEqual(output, [['name', 'age'], [ 'Bob', 4]])
    });

    it('WHERE boolean comparision', function () {
        const table = [['name', 'age', 'is new'], ['Alice',2, true], ['Alice', 10, false], ['Bob',4, true]]
        const output = WHERE(table, "*'is new' = TRUE")
        assert.deepEqual(output, [['name', 'age', 'is new'], ['Alice',2, true], [ 'Bob', 4, true]])
    });

    it('WHERE using cell reference', function () {
        const table = [['name', 'age'], ['Alice',2], ['Alice', 10], ['Bob',4]]
        spreadSheetData['A5'] = 10
        const output = WHERE(table, "*age < #A5")
        assert.deepEqual(output, [['name', 'age'], ['Alice',2], ['Bob',4]])
    });

    it('WHERE using OR clause', function () {
        const table = [['name', 'age', 'is new'], ['Alice',2, true], ['Alice', 10, false], ['Bob',4, true]]
        const output = WHERE(table, "*'is new' = FALSE OR *name='Bob'")
        assert.deepEqual(output, [['name', 'age', 'is new'], ['Alice',10, false], [ 'Bob', 4, true]])
    });

    it('WHERE using AND clause', function () {
        const table = [['name', 'age', 'is new'], ['Alice',2, true], ['Alice', 10, false], ['Bob',4, true]]
        const output = WHERE(table, "*'is new' = TRUE AND *name='Alice'")
        assert.deepEqual(output, [['name', 'age', 'is new'], ['Alice',2, true]])
    });
});

    