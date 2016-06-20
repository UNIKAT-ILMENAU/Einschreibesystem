<?php
/**
 * Created by IntelliJ IDEA.
 * User: Leon Bergmann
 * Company: SkyLab UG(haftungsbeschränkt)
 * Date: 02/05/16
 * Time: 18:29
 */
namespace Core\EntityBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;
/**
 * this class provides entitys of a e-mailtemplate and functions of a e-mailtemplate
 * @ORM\Entity()
 * @ORM\Table(name="email_template")
 */
class EmailTemplate{
    /**
     * id of e-mailtemplate
     * @var int
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    public $id;
    /**
     * name of e-mailtemplate
     * @var string
     * @ORM\Column(name="template_name", type="string", nullable=false)
     * @Serializer\Expose
     * @Serializer\SerializedName("template_name")
     */
    public $template_name;
    /**
     * subject of e-mailtemplate
     * @var string
     * @ORM\Column(name="email_subject", type="string", nullable=false)
     * @Serializer\Expose
     * @Serializer\SerializedName("email_subject")
     */
    public $email_subject;
    /**
     * body of e-mailtemplate
     * @var string
     * @ORM\Column(name="email_body", type="string", nullable=false)
     * @Serializer\Expose
     * @Serializer\SerializedName("email_body")
     */
    public $email_body;

    /**
     * function to get id of e-mailtemplate
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * function to set id of e-mailtemplate
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * function to get name of e-mailtemplate
     * @return mixed
     */
    public function getTemplateName()
    {
        return $this->template_name;
    }

    /**
     * function to set name of e-mailtemplate
     * @param mixed $template_name
     */
    public function setTemplateName($template_name)
    {
        $this->template_name = $template_name;
    }

    /**
     * function to get subject of e-mailtemplate
     * @return mixed
     */
    public function getEmailSubject()
    {
        return $this->email_subject;
    }

    /**
     * function to set e-mailtemplate
     * @param mixed $email_subject
     */
    public function setEmailSubject($email_subject)
    {
        $this->email_subject = $email_subject;
    }

    /**
     * function to get body of e-mailtemplate
     * @return mixed
     */
    public function getEmailBody()
    {
        return $this->email_body;
    }

    /**
     * function to set body of e-mailtemplate
     * @param mixed $email_body
     */
    public function setEmailBody($email_body)
    {
        $this->email_body = $email_body;
    }


}
