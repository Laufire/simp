# Simp

  A simple web-server, intended to be a drop-in replacement for WAMP server, to serve static sites and API-s.

## Decisions

* The server runs only onn 443 when SSL is enabled, not on 80, as it's assumed to be redirected.
