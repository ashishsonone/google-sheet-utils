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

describe('WHERE', function () {
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

describe('ORDER_BY', function () {
    it('ORDER_BY single column DESC', function () {
        const table = [['name', 'age'], ['Alice',21], ['Bob',4], ['Alice', 10]]
        const output = ORDER_BY(table, "*age DESC")
        assert.deepEqual(output, [['name', 'age'], ['Alice',21], ['Alice', 10], ['Bob',4]])
    })

    it('ORDER_BY single column refer by column letter', function () {
        const table = [['name', 'age'], ['Alice',21], ['Bob',4], ['Alice', 10]]
        const output = ORDER_BY(table, "*B ASC")
        assert.deepEqual(output, [['name', 'age'], ['Bob',4], ['Alice', 10], ['Alice',21]])
    })

    it('ORDER_BY single column ASC', function () {
        const table = [['name', 'age'], ['Alice',21], ['Bob',4], ['Alice', 10]]
        const output = ORDER_BY(table, "*age ASC")
        assert.deepEqual(output, [['name', 'age'], ['Bob',4], ['Alice', 10], ['Alice',21]])
    })

    it('ORDER_BY mulitiple columns numeric & text', function () {
        const table = [['name', 'age'], ['Alice',21], ['Bob',40], ['Alice', 10]]
        const output = ORDER_BY(table, "*name DESC, *age ASC")
        assert.deepEqual(output, [['name', 'age'], ['Bob',40], ['Alice', 10], ['Alice',21]])
    })
})

describe('GROUP_BY', function () {
    it('GROUP_BY single column, sum+count agg', function () {
        const table = [['name', 'age'], ['Alice',21], ['Bob',4], ['Alice', 10]]
        const output = GROUP_BY(table, "*name", "$SUM(*age), $COUNT(1)")
        assert.deepEqual(output, [['name', 'SUM B', 'COUNT 1'], ['Alice',31, 2], ['Bob', 4, 1]])
    })

    it('GROUP_BY multiple columns', function () {
        const table = [['name', 'city', 'age'], ['Alice', 'Bombay', 21], ['Bob', 'Delhi', 4], ['Alice', 'Bombay', 4], ['Alice', 'Delhi', 10]]
        const output = GROUP_BY(table, "*A,*B", "$COUNT(1)")
        assert.deepEqual(output, [['name', 'city', 'COUNT 1'], ['Alice','Bombay', 2], ['Bob', 'Delhi', 1], ['Alice', 'Delhi', 1]])
    })
})

describe('LEFT_JOIN', function () {
    it('LEFT_JOIN single column', function () {
        const students = [['name', 'age', 'school id'], ['Alice',21, 'S.1'], ['Bob',4, 'S.1'], ['Cathy', 10, 'S.2'], ['Darwin', 15, 'S.4']]
        const schools = [['id', 'city'], ['S.1', 'BOM'], ['S.2','BLR'], ['S.3', 'DEL']]

        const output = LEFT_JOIN(students, "*'school id'", schools, "*id")
        assert.deepEqual(output, [
            ['name', 'age', 'school id', 'id', 'city'],
            ['Alice',21, 'S.1', 'S.1', 'BOM'],
            ['Bob',4, 'S.1', 'S.1', 'BOM'],
            ['Cathy', 10, 'S.2', 'S.2','BLR'],
            ['Darwin', 15, 'S.4'] // no columns added here
        ])
    })
})