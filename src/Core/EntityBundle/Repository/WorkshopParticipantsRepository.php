<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Leon Bergmann, Marco Hanisch
 * Date: 03.05.2016
 * Time: 14:06
 */

namespace Core\EntityBundle\Repository;


use Core\EntityBundle\Entity\WorkshopParticipants;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

/**
 * this class provide the function to find participants of a workshop
 */
class WorkshopParticipantsRepository extends EntityRepository
{
    /**
     * function to find participants of a workshop
     *
     * @param $workshopId
     * @param $participantId
     *
     * @return WorkshopParticipants
     * @internal param int $workshopID id of a workshop
     * @internal param int $participantID id of a participant
     */
    public function findById($workshopId, $participantId)
    {
        $workshopParticipant = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findBy(
            [
                'workshop'    => $workshopId,
                'participant' => $participantId
            ]
        );
        return $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:WorkshopParticipants")->find(
            $workshopParticipant['id']
        );
    }
}
