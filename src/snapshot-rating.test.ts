import * as fs from 'fs';
import * as path from 'path';
import {
  ratingFilePath,
  loadRatings,
  setRating,
  removeRating,
  getRating,
  listRatings,
} from './snapshot-rating';

function cleanup() {
  const filePath = ratingFilePath();
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

beforeEach(cleanup);
afterAll(cleanup);

describe('setRating', () => {
  it('saves a rating for a snapshot', () => {
    const result = setRating('my-snap', 4, 'pretty good');
    expect(result.score).toBe(4);
    expect(result.note).toBe('pretty good');
    expect(result.ratedAt).toBeTruthy();
  });

  it('overwrites an existing rating', () => {
    setRating('my-snap', 3);
    setRating('my-snap', 5, 'updated');
    const rating = getRating('my-snap');
    expect(rating?.score).toBe(5);
    expect(rating?.note).toBe('updated');
  });

  it('throws for score out of range', () => {
    expect(() => setRating('my-snap', 0)).toThrow();
    expect(() => setRating('my-snap', 6)).toThrow();
  });
});

describe('getRating', () => {
  it('returns null for unknown snapshot', () => {
    expect(getRating('nonexistent')).toBeNull();
  });

  it('returns the stored rating', () => {
    setRating('snap-a', 2, 'needs work');
    const rating = getRating('snap-a');
    expect(rating?.score).toBe(2);
    expect(rating?.note).toBe('needs work');
  });
});

describe('removeRating', () => {
  it('removes an existing rating and returns true', () => {
    setRating('snap-b', 3);
    expect(removeRating('snap-b')).toBe(true);
    expect(getRating('snap-b')).toBeNull();
  });

  it('returns false when rating does not exist', () => {
    expect(removeRating('ghost')).toBe(false);
  });
});

describe('listRatings', () => {
  it('returns all ratings sorted by score descending', () => {
    setRating('snap-low', 1);
    setRating('snap-high', 5);
    setRating('snap-mid', 3);
    const list = listRatings();
    expect(list[0].name).toBe('snap-high');
    expect(list[list.length - 1].name).toBe('snap-low');
  });

  it('returns empty array when no ratings exist', () => {
    expect(listRatings()).toEqual([]);
  });
});

describe('loadRatings', () => {
  it('returns empty object when file does not exist', () => {
    expect(loadRatings()).toEqual({});
  });
});
