:repeats
timeout /t 10
(docker cp  %1 %2) || goto :repeats
echo Success!

