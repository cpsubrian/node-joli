describe('styles', function () {
  var movies = [
    { title: 'Avatar', gross: 2782275172, year: 2009 },
    { title: 'Titanic', gross: 2185372302, year: 1997 },
    { title: 'The Avengers', gross: 1511757910, year: 2012 },
    { title: 'Harry Potter and the Deathly Hallows - Part 2', gross: 1328111219, year: 2011 },
    { title: 'Transformers: Dark of the Moon', gross: 1123746996, year: 2011 }
  ];

  it('can filter data', function () {
    var style = {
      filter: function (data) {
        return data.year === 2012;
      }
    };
    var styled = joli.style(movies, style);
    assert.equal(styled.length, 1);
    assert.equal(styled[0].title, 'The Avengers');
  });

  it('can reduce data', function () {
    var style = {
      reduce: function (prev, curr) {
        return (prev.gross ? prev.gross : prev ) + curr.gross;
      }
    };
    var total = joli.style(movies, style);
    var check = movies.reduce(function (prev, curr) {
      return (prev.gross ? prev.gross : prev ) + curr.gross;
    });
    assert.equal(total, check);
  });

  it('can reduce data with an initial value', function () {
    var style = {
      reduce: function (years, movie) {
        if (!years[movie.year]) {
          years[movie.year] = 1;
        }
        else {
          years[movie.year]++;
        }
        return years;
      },
      reduceInitialValue: {}
    };
    var years = joli.style(movies, style);
    assert.equal(years[2009], 1);
    assert.equal(years[2011], 2);
  });

  it('can map data', function () {
    var style = {
      map: function (data) {
        return data.title;
      }
    };
    var titles = joli.style(movies, style);
    assert.equal(titles.length, movies.length);
    assert.equal(titles[0], 'Avatar');
  });

  it('can load local styles', function () {
    assert(joli.styles.keys);
  });

});