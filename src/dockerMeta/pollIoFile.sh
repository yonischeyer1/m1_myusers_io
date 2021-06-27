until docker cp "$1" "$2" 
do
  sleep 10s
  echo "waited 10 seconds trying again for container $1 $2"
done
echo "foto finish"