#!/bin/sh
# =============================================================================
# BizCore — point d'entrée Docker
# Render fournit l'URL Postgres au format  postgresql://user:pass@host[:port]/db
# (non compatible avec spring.datasource.url qui exige jdbc:postgresql://...).
# Ce script la convertit automatiquement au démarrage : aucune variable DB à
# saisir à la main. Si SPRING_DATASOURCE_URL est déjà défini, on n'y touche pas.
# =============================================================================
set -e

if [ -n "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  url="$DATABASE_URL"
  no_scheme="${url#*://}"          # user:pass@host[:port]/db?params
  userinfo="${no_scheme%%@*}"      # user:pass
  hostpart="${no_scheme#*@}"       # host[:port]/db?params
  user="${userinfo%%:*}"           # user
  pass="${userinfo#*:}"            # pass
  hostport="${hostpart%%/*}"       # host[:port]
  dbpart="${hostpart#*/}"          # db?params
  dbname="${dbpart%%\?*}"          # db (paramètres ?sslmode=... retirés)

  case "$hostport" in
    *:*) host="${hostport%%:*}"; port="${hostport##*:}" ;;
    *)   host="$hostport";       port="5432" ;;
  esac

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${host}:${port}/${dbname}"
  export SPRING_DATASOURCE_USERNAME="${user}"
  export SPRING_DATASOURCE_PASSWORD="${pass}"

  echo "[entrypoint] Datasource -> jdbc:postgresql://${host}:${port}/${dbname} (user=${user})"
fi

exec java $JAVA_OPTS -jar app.jar
