FROM node:lts-alpine

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN mkdir -p /home/node/.cache /home/node/.npm \
    && chown -R node:node /app /home/node

USER node

COPY --chown=node:node package*.json ./
RUN --mount=type=cache,id=abvc-mobile-npm,target=/home/node/.npm,uid=1000,gid=1000 npm ci

COPY --chown=node:node . ./
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "HOST=0.0.0.0 PORT=3000 npm start"]
