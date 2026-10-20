import assert from 'node:assert/strict';
import { joinStoreNotes, splitStoreNotes } from '../src/store-info/store-info-legacy-maps';

const original = 'Ghi chú cửa hàng - Theo dõi Facebook.';
const url = 'https://maps.app.goo.gl/AbCd123';
const encoded = joinStoreNotes(original, url);
assert(encoded?.includes('STORE_INFO_GOOGLE_MAPS_V1'));
assert.deepEqual(splitStoreNotes(encoded), { notes: original, googleMapsUrl: url });
assert.deepEqual(splitStoreNotes(joinStoreNotes(encoded, null)), { notes: original, googleMapsUrl: null });
assert.deepEqual(splitStoreNotes(joinStoreNotes(encoded, 'https://www.google.com/maps/place/Test')), {
  notes: original, googleMapsUrl: 'https://www.google.com/maps/place/Test',
});
assert.deepEqual(splitStoreNotes(original), { notes: original, googleMapsUrl: null });
assert.equal(splitStoreNotes(null).googleMapsUrl, null);
assert.equal(splitStoreNotes('A\n[STORE_INFO_GOOGLE_MAPS_V1]bad').notes, 'A\n[STORE_INFO_GOOGLE_MAPS_V1]bad');
console.log('StoreInfo legacy Maps compatibility tests passed.');
