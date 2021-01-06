import {verifyToken} from "../lambda/auth/auth0Authorizer"
import { assert } from 'chai';
import 'mocha';


describe('add function', () => {

    it('jwtTest', async () => {
        const payload = await verifyToken("bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImY0RXVSWnFWQWFwdFBEaWtSWjJoUyJ9.eyJpc3MiOiJodHRwczovL2Rldi1kYXRhY2FtcDI2NC5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWZmMjZkZGJiOWFhNGIwMDc2NjYzZDM3IiwiYXVkIjoiY20xdnNXeXRNWWFrd1l6VGxJWFV5VU5pbElaMUhCSXMiLCJpYXQiOjE2MDk3MjMzNjEsImV4cCI6MTYxNDA4MzM2MSwiYXRfaGFzaCI6InZ6ZlNrMk02MVMxVE9CckJFZkduZHciLCJub25jZSI6ImRtdXZWOTFtLmZrazZOUEhCMllhcjBwMWVDQUl2WVVjIn0.fwANQtkP3NLcrTbpoGtNsqXrqkdsxam_JJf7Ed7oeM5BdVhkgsEjEEoWQ33x28LVQBJJYUIIb_AFjUegRci3o86dboqmm3fkSChjaxlDakqwmxVJ_TXQsRO1nOmLH8kr4DvFl2gfBw_Kd5YYha_JeBZCXZv5AuxenwuaswHMEsfD7YDNVH7zzm45_R5pgo-fx1kdknICOUsBxyqciTcNixlHQE6eS5z0Mjk7BpxP4OvXyjIdXGbjUYwrh_1db6tJrlUJMj3iy53GvKbSzt2RnVjp6yp9W1EemRJsz5duQRg3NARCKsP4FgZzSoSdCbexXssi0SHxzknmctmF5hutHg");
        console.log(payload);
        assert.equal(payload.sub, "auth0|5ff26ddbb9aa4b0076663d37")
    });
});
