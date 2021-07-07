dockerize -wait tcp://redis-server -timeout 20s

echo "Start server"
npm run dev