INSERT INTO public.base_scenery (base_id, description, image_urls)
VALUES
((SELECT id FROM public.hems_bases WHERE name = 'LifeFlight 1'), 'Official base photo for LifeFlight 1.', '["https://app.box.com/s/gpy4hmah65ibd4uk8zc4vmuuona1o34e"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'LifeFlight 2'), 'Official base photo for LifeFlight 2.', '["https://app.box.com/s/jwe3m0l6fu7yf482gydsv9hz8at7pc2x"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'LifeFlight 3'), 'Official base photo for LifeFlight 3.', '["https://app.box.com/s/ifdagwgnv3wreys1rwyb4vt3bdrm658e"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'LifeFlight 4'), 'Official base photo for LifeFlight 4.', '["https://app.box.com/s/dniivq48lnkjqq1yewlq9vl9rce7r6he"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'LifeFlight 5'), 'Official base photo for LifeFlight 5.', '["https://app.box.com/s/kuotdvczh2eik64zydzjnl36jht4sihk"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 1'), 'Official base photo for Stat 1.', '["https://app.box.com/s/fcvlbx8miwgh1lt08b4k9e5ky4dguubl"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 2'), 'Official base photo for Stat 2.', '["https://app.box.com/s/hqlxx7gjtlkppegk1zjigmk7q7lceepc"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 3'), 'Official base photo for Stat 3.', '["https://app.box.com/s/eur9qduiyqgdr3a2srmdvosetojoxvor"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 4'), 'Official base photo for Stat 4.', '["https://app.box.com/s/u3fsqs0q1zconri679evmd8wx2np0tg7"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 5'), 'Official base photo for Stat 5.', '["https://app.box.com/s/7uhlp3k1zzb86usaoucmssdtq06fiicc"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 6'), 'Official base photo for Stat 6.', '["https://app.box.com/s/xrifdgt86hdekhe0tjiduonr0prore4b"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 7'), 'Official base photo for Stat 7.', '["https://app.box.com/s/gsf7c8qvmgkwl0i639rani3fjrwiy7rz"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 8'), 'Official base photo for Stat 8.', '["https://app.box.com/s/egkt57c8crf8xgfe50om3tj1m8y7ztj5"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 9'), 'Official base photo for Stat 9.', '["https://app.box.com/s/yo1k127lnawoz7vsdmwu4g91urlq0p0h"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 10'), 'Official base photo for Stat 10.', '["https://app.box.com/s/xekfv6c8q2hktpb48vdglanj7egmyxm0"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 11'), 'Official base photo for Stat 11.', '["https://app.box.com/s/1qjchxgq20okt9eqp78dk8yp5duisq09"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 12'), 'Official base photo for Stat 12.', '["https://app.box.com/s/nzepx9a2a4of1udfdb44nrja7wxy5cjw"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 13'), 'Official base photo for Stat 13.', '["https://app.box.com/s/e23snvzp09c5u5htstog5qo9zs1whgeu"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 14'), 'Official base photo for Stat 14.', '["https://app.box.com/s/5he9ty5ves1n8bdxu540trq1swgfgxdu"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 15'), 'Official base photo for Stat 15.', '["https://app.box.com/s/tn5jewsshc6t5q20eygohuszp2dsle59"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 16'), 'Official base photo for Stat 16.', '["https://app.box.com/s/rgi6hbh176dijrdk99bopwmczrg1mcpk"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 17'), 'Official base photo for Stat 17.', '["https://app.box.com/s/yovc7j4uj6tsbclbjfzqbpr1c1mddny0"]'::jsonb),
((SELECT id FROM public.hems_bases WHERE name = 'Stat 18'), 'Official base photo for Stat 18.', '["https://app.box.com/s/s5e634w7d8a9xe8wn72vswico0mhzzx9"]'::jsonb)
ON CONFLICT (base_id) DO UPDATE
SET description = EXCLUDED.description, image_urls = EXCLUDED.image_urls;